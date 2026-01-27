from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from auditoria.services import registrar_auditoria
from auditoria.enums import TipoEventoAuditoria, ModuloAuditoria
from cajas.enums import TipoMovimientoCaja
from cajas.models import MovimientoCaja
from inventario.enums import TipoMovimientoInventario
from inventario.models import Ingrediente, MovimientoInventario
from .models import Venta

@transaction.atomic
def crear_venta(pedido, caja, usuario, metodo_pago):

        if pedido.estado != 'CERRADO':
            raise ValidationError("El pedido debe estar cerrado para realizar la venta.")
        
        if hasattr(pedido, 'venta'):
            raise ValidationError("El pedido ya tiene una venta asociada.")
        
        if not caja.abierta:
            raise ValidationError("La caja debe estar abierta para registrar una venta.")

        monto_total = sum(detalle.subtotal() for detalle in pedido.detalles.all())

        venta = Venta.objects.create(
            pedido=pedido,
            caja=caja,
            usuario=usuario,
            monto_total=monto_total,
            metodo_pago=metodo_pago
        )

        MovimientoCaja.objects.create(
            caja=caja,
            tipo=TipoMovimientoCaja.INGRESO,
            monto=monto_total,
            descripcion=f'Venta realizada para el pedido {pedido.id}'
        )

        registrar_auditoria(
            usuario=usuario,
            accion=TipoEventoAuditoria.CREAR,
            modulo=ModuloAuditoria.VENTAS,
            descripcion=f'Se creó la venta {venta.id} para el pedido {pedido.id}'
        )

        ingredientes_ids = set()
        for detalle in pedido.detalles.all():
            for receta in detalle.producto.recetas.all():
                ingredientes_ids.add(receta.ingrediente.id)

        list(Ingrediente.objects.select_for_update().filter(id__in=ingredientes_ids))

        for detalle in pedido.detalles.select_related('producto'):
            for receta in detalle.producto.recetas.select_related('ingrediente'):

                ingrediente = receta.ingrediente
                cantidad = receta.cantidad * detalle.cantidad

                if ingrediente.stock_actual < cantidad:
                    raise ValidationError(f'Stock insuficiente para {ingrediente.nombre}')

                ingrediente.stock_actual = F('stock_actual') - cantidad
                ingrediente.save()
                ingrediente.refresh_from_db()

                MovimientoInventario.objects.create(
                    ingrediente=ingrediente,
                    cantidad=cantidad,
                    tipo_movimiento=TipoMovimientoInventario.SALIDA,
                    motivo=f'Venta Pedido {pedido.id}',
                    venta=venta
                )

        return venta

@transaction.atomic
def anular_venta(venta, usuario_anulacion):

        if venta.anulada:
            raise ValidationError("La venta ya está anulada.")

        MovimientoCaja.objects.create(
            caja=venta.caja,
            tipo=TipoMovimientoCaja.EGRESO,
            monto=venta.monto_total,
            descripcion=f'Anulación de venta para el pedido {venta.pedido.id}'
        )

        registrar_auditoria(
            usuario=usuario_anulacion,
            accion=TipoEventoAuditoria.ANULAR,
            modulo=ModuloAuditoria.VENTAS,
            descripcion=f'Se anuló la venta {venta.id} para el pedido {venta.pedido.id}'
        )

        for detalle in venta.pedido.detalles.select_related('producto'):
            for receta in detalle.producto.recetas.select_related('ingrediente'):

                ingrediente = receta.ingrediente
                cantidad = receta.cantidad * detalle.cantidad

                ingrediente.stock_actual = F('stock_actual') + cantidad
                ingrediente.save()
                ingrediente.refresh_from_db()

                MovimientoInventario.objects.create(
                    ingrediente=ingrediente,
                    cantidad=cantidad,
                    tipo_movimiento=TipoMovimientoInventario.ENTRADA,
                    motivo=f'Anulación de venta Pedido {venta.pedido.id}',
                    venta=venta
                )

        venta.anulada = True
        venta.usuario_anulacion = usuario_anulacion
        venta.fecha_anulacion = timezone.now()
        venta.save(update_fields=['anulada', 'usuario_anulacion', 'fecha_anulacion'])