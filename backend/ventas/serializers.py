from rest_framework import serializers
from .models import Venta, Boleta

class BolletaSerializer(serializers.ModelSerializer):
    venta_id = serializers.IntegerField(source='venta.id', read_only=True)
    estado_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Boleta
        fields = ['id', 'numero', 'venta_id', 'fecha_emision', 'estado', 'estado_display', 'xml', 'creado', 'modificado']
        read_only_fields = ['id', 'fecha_emision', 'creado', 'modificado', 'venta_id', 'estado_display']
    
    def get_estado_display(self, obj):
        return obj.get_estado_display()

class VentaSerializer(serializers.ModelSerializer):
    pedido_id = serializers.PrimaryKeyRelatedField(source='pedido.id', read_only=True)
    caja_id = serializers.IntegerField(source='caja.id', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_anulacion_username = serializers.CharField(source='usuario_anulacion.username', read_only=True, allow_null=True)
    metodo_pago_display = serializers.SerializerMethodField()
    boleta = BolletaSerializer(read_only=True)
    
    class Meta:
        model = Venta
        fields = ['id', 'pedido','pedido_id','caja', 'caja_id', 'usuario','usuario_username', 'usuario_anulacion_username','monto_total', 'metodo_pago','metodo_pago_display', 'fecha_venta', 'anulada', 'fecha_anulacion', 'boleta', 'creado', 'modificado']
        read_only_fields = ['id', 'fecha_venta','creado', 'modificado','pedido_id','caja_id','usuario_username','usuario_anulacion_username','metodo_pago_display', 'boleta']

    def get_metodo_pago_display(self, obj):
        return obj.get_metodo_pago_display()