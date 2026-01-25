from django.db import models, transaction
from django.db.models import F
from django.utils import timezone
from django.core.exceptions import ValidationError

from cajas.enums import TipoMovimientoCaja
from inventario.enums import TipoMovimientoInventario
from core.models import ModeloBase, Usuario
from pedidos.models import Pedido
from cajas.models import Caja, MovimientoCaja
from ventas.enums import MetodoPago
from inventario.models import MovimientoInventario, Ingrediente


class Venta(ModeloBase):
    pedido = models.OneToOneField(
        Pedido,
        on_delete=models.PROTECT,
        related_name='venta'
    )
    caja = models.ForeignKey(
        Caja,
        on_delete=models.PROTECT,
        related_name='ventas'
    )
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.PROTECT,
        related_name='ventas_realizadas'
    )
    usuario_anulacion = models.ForeignKey(
        Usuario,
        null=True, blank=True,
        related_name='ventas_anuladas',
        on_delete=models.PROTECT
    )
    fecha_anulacion = models.DateTimeField(null=True, blank=True)

    monto_total = models.IntegerField()
    metodo_pago = models.CharField(
        max_length=20,
        choices=MetodoPago.choices
    )
    fecha_venta = models.DateTimeField(auto_now_add=True)
    anulada = models.BooleanField(default=False)

    @staticmethod
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

        ingredientes_ids = []
        for detalle in pedido.detalles.all():
            for receta in detalle.producto.recetas.all():
                ingredientes_ids.append(receta.ingrediente.id)

        Ingrediente.objects.select_for_update().filter(id__in=ingredientes_ids)

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
    def anular_venta(self, usuario_anulacion):

        if self.anulada:
            raise ValidationError("La venta ya está anulada.")

        MovimientoCaja.objects.create(
            caja=self.caja,
            tipo=TipoMovimientoCaja.EGRESO,
            monto=self.monto_total,
            descripcion=f'Anulación de venta para el pedido {self.pedido.id}'
        )

        for detalle in self.pedido.detalles.select_related('producto'):
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
                    motivo=f'Anulación de venta Pedido {self.pedido.id}',
                    venta=self
                )

        self.anulada = True
        self.usuario_anulacion = usuario_anulacion
        self.fecha_anulacion = timezone.now()
        self.save(update_fields=['anulada', 'usuario_anulacion', 'fecha_anulacion'])

    def __str__(self):
        return f"Venta {self.id} - Pedido {self.pedido.id} - Monto: {self.monto_total}"

    class Meta:
        indexes = [
            models.Index(fields=['fecha_venta']),
            models.Index(fields=['metodo_pago']),
        ]
