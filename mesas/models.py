from django.db import models
from core.models import ModeloBase
from .enums import EstadoMesa
from pedidos.models import Pedido
from core.models import Usuario

class Sala(ModeloBase):
    nombre = models.CharField(max_length=100, unique=True)
    orden = models.PositiveIntegerField(default=0)

class Mesa(ModeloBase):
    numero = models.PositiveIntegerField()
    sala = models.ForeignKey(Sala, on_delete=models.PROTECT, null=True, blank=True, related_name='mesas')
    capacidad = models.PositiveIntegerField()
    estado = models.CharField(
        max_length=20,
        choices=EstadoMesa.choices,
        default=EstadoMesa.DISPONIBLE,
    )
    pos_x = models.PositiveIntegerField(null=True, blank=True)
    pos_y = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        unique_together = ('numero', 'sala')

    def __str__(self):
        return f"Mesa {self.numero} ({self.sala.nombre}) - {self.estado}"



