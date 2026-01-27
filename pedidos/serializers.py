from rest_framework import serializers
from .models import Pedido, DetallePedido,TrasladoMesa

class PedidoSerializer(serializers.ModelSerializer):
    mesa_numero = serializers.IntegerField(source='mesa.numero', read_only=True)
    camarero_nombre = serializers.CharField(source='camarero.username', read_only=True)
    class Meta:
        model = Pedido
        fields = ['id', 'mesa', 'mesa_numero', 'camarero', 'camarero_nombre', 'estado', 'fecha_pedido','creado','modificado']
        read_only_fields = ['id', 'fecha_pedido','creado','modificado','mesa_numero','camarero_nombre']

class DetallePedidoSerializer(serializers.ModelSerializer):
    nombre_producto = serializers.CharField(source='producto.nombre', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = DetallePedido
        fields = ['id', 'pedido', 'producto', 'cantidad', 'precio_unitario', 'subtotal','creado','modificado','nombre_producto']
        read_only_fields = ['id','subtotal','creado','modificado','nombre_producto']

    def get_subtotal(self, obj):
        return obj.cantidad * obj.precio_unitario
    
class TrasladoMesaSerializer(serializers.ModelSerializer):
    mesa_origen_numero = serializers.IntegerField(source='mesa_origen.numero', read_only=True)
    mesa_destino_numero = serializers.IntegerField(source='mesa_destino.numero', read_only=True)
    id_pedido= serializers.IntegerField(source='pedido.id', read_only=True)
    usuario_username= serializers.CharField(source='usuario.username', read_only=True)
    class Meta:
        model = TrasladoMesa
        fields = ['id', 'pedido','id_pedido', 'mesa_origen', 'mesa_origen_numero', 'mesa_destino', 'mesa_destino_numero', 'usuario','usuario_username','creado','modificado']
        read_only_fields = ['id','creado','modificado','mesa_origen_numero','mesa_destino_numero','id_pedido','usuario_username']

