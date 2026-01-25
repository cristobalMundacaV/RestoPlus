from django.db import models

from core.models import ModeloBase
from core.models import Modulo

class Restaurante(ModeloBase):
    nombre = models.CharField(max_length=200)
    razon_social = models.CharField(max_length=200)
    rut = models.CharField(max_length=12, unique=True)
    direccion = models.CharField(max_length=300, blank=True, null=True)
    activo = models.BooleanField(default=True)
    plan = models.ForeignKey(
        'Plan',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='restaurantes'
    )


    def __str__(self):
        return self.nombre
    
class RestauranteModulos(ModeloBase):
    restaurante = models.ForeignKey(
        Restaurante,
        on_delete=models.CASCADE,
        related_name='modulos_restaurante'
    )
    modulo = models.ForeignKey(
        'core.Modulo',
        on_delete=models.CASCADE,
        related_name='restaurantes_modulo'
    )
    
    activo=models.BooleanField(default=True)
    fecha_activacion=models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('restaurante', 'modulo')

    def __str__(self):
        return f"{self.restaurante.nombre} - {self.modulo.nombre}"
    
class Plan(ModeloBase):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    modulos=models.ManyToManyField(
        Modulo,
        related_name='planes'
    )

    def __str__(self):
        return self.nombre

