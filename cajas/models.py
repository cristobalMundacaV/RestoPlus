from django.db import models
from django.db.models import Sum
from django.core.exceptions import ValidationError
from cajas.enums import TipoMovimientoCaja
from core.models import ModeloBase
from django.utils import timezone

class Caja(ModeloBase):
    usuario_apertura = models.ForeignKey(
        'core.Usuario',
        on_delete=models.PROTECT,
        related_name='cajas_abiertas'
    )
    usuario_cierre = models.ForeignKey(
        'core.Usuario',
        on_delete=models.PROTECT,
        related_name='cajas_cerradas',
        null=True,
        blank=True
    )
    saldo_inicial = models.IntegerField(default=0)
    abierta = models.BooleanField(default=True)
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)

    def cerrar(self, usuario):
        if not self.abierta:
            raise ValidationError("La caja ya está cerrada")
        self.abierta = False
        self.usuario_cierre = usuario
        self.fecha_cierre = timezone.now()
        self.save(update_fields=["abierta", "usuario_cierre", "fecha_cierre"])

    @property
    def total_ingresos(self):
        return self.movimientos.filter(
            tipo=TipoMovimientoCaja.INGRESO
        ).aggregate(total=Sum('monto'))['total'] or 0

    @property
    def total_egresos(self):
        return self.movimientos.filter(
            tipo=TipoMovimientoCaja.EGRESO
        ).aggregate(total=Sum('monto'))['total'] or 0

    @property
    def saldo_actual(self):
        return self.saldo_inicial + self.total_ingresos - self.total_egresos
    
    def puede_registrar_movimientos(self):
        return self.abierta
    
    def __str__(self):
        return f"Caja abierta por {self.usuario_apertura} - Saldo inicial: {self.saldo_inicial}"
    
class MovimientoCaja(ModeloBase):
    caja = models.ForeignKey(
        Caja,
        on_delete=models.CASCADE,
        related_name='movimientos'
    )
    tipo = models.CharField(
        max_length=10,
        choices=TipoMovimientoCaja.choices
    )
    descripcion = models.CharField(max_length=255)
    monto = models.IntegerField()
    fecha_movimiento = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.monto <= 0:
            raise ValidationError("El monto debe ser mayor a cero")
        if not self.caja.puede_registrar_movimientos():
            raise ValidationError(
                "No se pueden registrar movimientos en una caja cerrada"
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Movimiento de {self.monto} en caja {self.caja.id} - {self.descripcion}"
    
    class Meta:
        ordering = ['fecha_movimiento']
