"""
Servicios de negocio para pedidos
"""
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Pedido, DetallePedido
from inventario.models import Receta, MovimientoInventario, Ingrediente
from inventario.enums import TipoMovimientoInventario


class PedidoService:
    """Servicio de negocio para pedidos"""
    
    @staticmethod
    @transaction.atomic
    def crear_pedido_con_deduccion(data_pedido, detalles_data, usuario):
        """
        Crea un pedido y deduce automáticamente el stock de ingredientes
        
        Args:
            data_pedido: Dict con datos del pedido (mesa, camarero, etc)
            detalles_data: List de dicts con productos y cantidades
            usuario: Usuario que crea el pedido
        
        Returns:
            Pedido: Instancia del pedido creado
            
        Raises:
            ValidationError: Si no hay stock suficiente
        """
        # Validar stock antes de crear
        for detalle_data in detalles_data:
            producto = detalle_data['producto']
            cantidad = detalle_data['cantidad']
            
            # Verificar ingredientes disponibles
            PedidoService._validar_stock_producto(producto, cantidad)
        
        # Crear pedido
        pedido = Pedido.objects.create(**data_pedido)
        
        # Crear detalles y deducir stock
        for detalle_data in detalles_data:
            producto = detalle_data['producto']
            cantidad = detalle_data['cantidad']
            precio_unitario = detalle_data.get('precio_unitario', producto.precio)
            
            # Crear detalle
            DetallePedido.objects.create(
                pedido=pedido,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=precio_unitario
            )
            
            # Deducir stock de ingredientes
            PedidoService._deducir_ingredientes_producto(producto, cantidad, pedido)
        
        return pedido
    
    @staticmethod
    def _validar_stock_producto(producto, cantidad):
        """
        Valida que haya stock suficiente de todos los ingredientes
        
        Raises:
            ValidationError: Si falta stock de algún ingrediente
        """
        recetas = Receta.objects.filter(producto=producto).select_related('ingrediente')
        
        ingredientes_faltantes = []
        
        for receta in recetas:
            cantidad_requerida = receta.cantidad * cantidad
            ingrediente = receta.ingrediente
            
            if ingrediente.stock_actual < cantidad_requerida:
                ingredientes_faltantes.append({
                    'nombre': ingrediente.nombre,
                    'requerido': cantidad_requerida,
                    'disponible': ingrediente.stock_actual,
                    'faltante': cantidad_requerida - ingrediente.stock_actual
                })
        
        if ingredientes_faltantes:
            mensaje = f"Stock insuficiente para {producto.nombre}:\n"
            for ing in ingredientes_faltantes:
                mensaje += f"- {ing['nombre']}: necesita {ing['requerido']} {ing.get('unidad', 'unidades')}, "
                mensaje += f"disponible {ing['disponible']}, falta {ing['faltante']}\n"
            raise ValidationError(mensaje)
    
    @staticmethod
    def _deducir_ingredientes_producto(producto, cantidad, pedido):
        """
        Deduce el stock de ingredientes según las recetas del producto
        
        Args:
            producto: Producto del pedido
            cantidad: Cantidad de productos pedidos
            pedido: Instancia del pedido (para referencia en movimientos)
        """
        recetas = Receta.objects.filter(producto=producto).select_related('ingrediente')
        
        for receta in recetas:
            ingrediente = receta.ingrediente
            cantidad_a_deducir = receta.cantidad * cantidad
            
            # Actualizar stock
            ingrediente.stock_actual -= cantidad_a_deducir
            ingrediente.save(update_fields=['stock_actual'])
            
            # Registrar movimiento
            MovimientoInventario.objects.create(
                ingrediente=ingrediente,
                cantidad=cantidad_a_deducir,
                tipo_movimiento=TipoMovimientoInventario.EGRESO,
                motivo=f'Pedido {pedido.id} - {cantidad}x {producto.nombre}'
            )
    
    @staticmethod
    @transaction.atomic
    def cancelar_pedido_con_reversion(pedido):
        """
        Cancela un pedido y revierte el stock deducido
        
        Args:
            pedido: Instancia del pedido a cancelar
            
        Raises:
            ValidationError: Si el pedido ya está cancelado o cerrado
        """
        from pedidos.models import EstadoPedido
        
        if pedido.estado == EstadoPedido.CANCELADO:
            raise ValidationError("El pedido ya está cancelado")
        
        if pedido.estado == EstadoPedido.CERRADO:
            raise ValidationError("No se puede cancelar un pedido cerrado")
        
        # Revertir stock de cada detalle
        for detalle in pedido.detalles.select_related('producto').all():
            PedidoService._revertir_ingredientes_producto(
                detalle.producto,
                detalle.cantidad,
                pedido
            )
        
        # Cambiar estado
        pedido.estado = EstadoPedido.CANCELADO
        pedido.save(update_fields=['estado'])
        
        return pedido
    
    @staticmethod
    def _revertir_ingredientes_producto(producto, cantidad, pedido):
        """
        Revierte la deducción de stock de ingredientes
        
        Args:
            producto: Producto del pedido
            cantidad: Cantidad de productos a revertir
            pedido: Instancia del pedido (para referencia en movimientos)
        """
        recetas = Receta.objects.filter(producto=producto).select_related('ingrediente')
        
        for receta in recetas:
            ingrediente = receta.ingrediente
            cantidad_a_revertir = receta.cantidad * cantidad
            
            # Restaurar stock
            ingrediente.stock_actual += cantidad_a_revertir
            ingrediente.save(update_fields=['stock_actual'])
            
            # Registrar movimiento de ingreso (reversión)
            MovimientoInventario.objects.create(
                ingrediente=ingrediente,
                cantidad=cantidad_a_revertir,
                tipo_movimiento=TipoMovimientoInventario.INGRESO,
                motivo=f'Cancelación pedido {pedido.id} - {cantidad}x {producto.nombre}'
            )
