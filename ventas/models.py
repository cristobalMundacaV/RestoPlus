from django.db import models, transaction
from django.db.models import F
from django.utils import timezone
from django.core.exceptions import ValidationError

from auditoria.models import Auditoria
from auditoria.services import registrar_auditoria
from cajas.enums import TipoMovimientoCaja
from inventario.enums import TipoMovimientoInventario
from core.models import ModeloBase, Usuario
from pedidos.models import Pedido
from cajas.models import Caja, MovimientoCaja
from ventas.enums import MetodoPago
from inventario.models import MovimientoInventario, Ingrediente
from auditoria.enums import TipoEventoAuditoria, ModuloAuditoria


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

    def __str__(self):
        return f"Venta {self.id} - Pedido {self.pedido.id} - Monto: {self.monto_total}"

    class Meta:
        indexes = [
            models.Index(fields=['fecha_venta']),
            models.Index(fields=['metodo_pago']),
        ]
