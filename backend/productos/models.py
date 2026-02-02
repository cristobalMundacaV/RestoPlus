from django.db import models
from core.models import ModeloBase
from productos.enums import CategoriaProducto

class Categoria(ModeloBase):
    restaurante = models.ForeignKey(
        'restaurantes.Restaurante',
        on_delete=models.CASCADE,
        related_name='categorias',
        null=True
    )
    nombre = models.CharField(max_length=100, choices=CategoriaProducto.choices)
    orden = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)

    class Meta:
        unique_together = [['restaurante', 'nombre']]

    def __str__(self):
        return self.nombre
    
class Producto(ModeloBase):
    restaurante = models.ForeignKey(
        'restaurantes.Restaurante',
        on_delete=models.CASCADE,
        related_name='productos',
        null=True
    )
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
