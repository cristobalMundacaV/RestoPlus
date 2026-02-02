from django.db import models

from core.models import ModeloBase
from inventario.enums import TipoMovimientoInventario, TipoInsumo

class Ingrediente(ModeloBase):
    nombre = models.CharField(max_length=200)
    unidad_medida = models.CharField(max_length=100)
    tipo_insumo = models.CharField(
        max_length=20,
        choices=TipoInsumo.choices,
        default=TipoInsumo.GENERAL,
        help_text='Crítico (carnes, licores), General (verduras, condimentos), Unitario (congelados/porciones)'
    )
    stock_actual = models.FloatField()
    stock_minimo = models.FloatField()
    es_critico = models.BooleanField(default=False)

    def __str__(self):
        return self.nombre
    
class Receta(ModeloBase):
    producto = models.ForeignKey(
        'productos.Producto',
        on_delete=models.CASCADE,
        related_name='recetas'
    )
    ingrediente = models.ForeignKey(
        Ingrediente,
        on_delete=models.PROTECT,
        related_name='recetas'
    )
    cantidad = models.FloatField()

    class Meta:
        unique_together = ('producto', 'ingrediente')

    def __str__(self):
        return f"{self.cantidad} de {self.ingrediente.nombre} para {self.producto.nombre}"
    
class MovimientoInventario(ModeloBase):
    ingrediente = models.ForeignKey(
        Ingrediente,
        on_delete=models.PROTECT,
        related_name='movimientos'
    )

    cantidad = models.FloatField()

    tipo_movimiento = models.CharField(
        max_length=10,
        choices=TipoMovimientoInventario.choices
    )
    motivo = models.CharField(max_length=200, blank=True, null=True)

    fecha_movimiento = models.DateTimeField(auto_now_add=True)

    venta = models.ForeignKey(
        'ventas.Venta',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='movimientos_inventario'
    )

    def __str__(self):
        return f"{self.tipo_movimiento} {self.cantidad} de {self.ingrediente.nombre} en {self.fecha_movimiento}"
