from django.db import models
from django.db.models import Sum,Case,When,Value,IntegerField
from django.core.exceptions import ValidationError
from cajas.enums import TipoMovimientoCaja
from core.models import ModeloBase
from django.utils import timezone

class CajaQuerySet(models.QuerySet):
    def con_saldos(self):
        return self.annotate(
            total_ingresos=Sum(
                Case(
                    When(movimientos__tipo=TipoMovimientoCaja.INGRESO, then='movimientos__monto'),
                    default=Value(0),
                    output_field=IntegerField()
                )
            ),
            total_egresos=Sum(
                Case(
                    When(movimientos__tipo=TipoMovimientoCaja.EGRESO, then='movimientos__monto'),
                    default=Value(0),
                    output_field=IntegerField()
                )
            )
        )

class CajaManager(models.Manager):
    def get_queryset(self):
        return CajaQuerySet(self.model, using=self._db)
    
    def con_saldos(self):
        return self.get_queryset().con_saldos()

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

    objects = CajaManager()

    def clean(self):
        if self.fecha_cierre and self.fecha_cierre < self.fecha_apertura:
            raise ValidationError("La fecha de cierre no puede ser anterior a la fecha de apertura")
    
    def __str__(self):
        estado="Abierta" if self.abierta else "Cerrada"
        return f"Caja {self.id} {estado} por {self.usuario_apertura} - Saldo inicial: {self.saldo_inicial}"
    
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

    def clean(self):
        if self.monto and self.monto <= 0:
            raise ValidationError({"monto": "El monto debe ser mayor a cero"})
        if self.caja and not self.caja.abierta:
            raise ValidationError({"caja": "No se pueden registrar movimientos en caja cerrada"})
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Movimiento de {self.monto} en caja {self.caja.id} - {self.descripcion}"
    
    class Meta:
        ordering = ['fecha_movimiento']
