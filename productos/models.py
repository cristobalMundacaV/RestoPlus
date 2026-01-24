from django.db import models
from core.models import ModeloBase

class Categoria(ModeloBase):
    nombre = models.CharField(max_length=100, unique=True)
    orden = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre
    
class Producto(ModeloBase):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    precio = models.IntegerField()   
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name='productos'
    )
    disponible = models.BooleanField(default=True)
    activo = models.BooleanField(default=True)
    favorito = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.nombre} - ${self.precio}"
