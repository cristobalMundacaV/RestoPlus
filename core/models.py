import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from .enums import RolUsuario


class ModeloBase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creado = models.DateTimeField(auto_now_add=True)
    modificado = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Usuario(AbstractUser,ModeloBase):

    restaurante = models.ForeignKey(
        'restaurantes.Restaurante',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='usuarios'
    )


    rol = models.CharField(
        max_length=20,
        choices=RolUsuario.choices,
        default=RolUsuario.MESERO,
    )

    def __str__(self):
        return f"{self.username} ({self.rol})"
    
class Modulo(ModeloBase):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre