from django.db import models
from core.models import ModeloBase, Usuario

class EstadoPedido(models.TextChoices):
    ABIERTO = 'ABIERTO', 'Abierto'
    EN_PREPARACION = 'EN_PREPARACION', 'En preparación'
    SERVIDO = 'SERVIDO', 'Servido'
    CERRADO = 'CERRADO', 'Cerrado'
    CANCELADO = 'CANCELADO', 'Cancelado'

class Pedido(ModeloBase):
    mesa = models.ForeignKey(
        'mesas.Mesa',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='pedidos'
    )
    camarero = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={'rol': 'MESERO'}
    )
    estado = models.CharField(
        max_length=20,
        choices=EstadoPedido.choices,
        default=EstadoPedido.ABIERTO
    )
    fecha_pedido = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        mesa = self.mesa.numero if self.mesa else "Mostrador"
        return f"Pedido {self.id} - Mesa {mesa} - {self.estado}"

class DetallePedido(ModeloBase):
    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        related_name='detalles'
    )
    producto = models.ForeignKey(
        'productos.Producto',
        on_delete=models.PROTECT
    )
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.IntegerField()
    class Meta:
        unique_together = ('pedido', 'producto')


    def subtotal(self):
        return self.cantidad * self.precio_unitario

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre} (Pedido {self.pedido.id})"

class TrasladoMesa(ModeloBase):
    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        related_name='traslados'
    )
    mesa_origen = models.ForeignKey(
        'mesas.Mesa',
        on_delete=models.PROTECT,
        related_name='traslados_origen'
    )
    mesa_destino = models.ForeignKey(
        'mesas.Mesa',
        on_delete=models.PROTECT,
        related_name='traslados_destino'
    )
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True
    )

    def __str__(self):
        return f"Pedido {self.pedido.id} de Mesa {self.mesa_origen.numero} a Mesa {self.mesa_destino.numero}"
