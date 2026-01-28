from rest_framework import serializers
from .models import Venta

class VentaSerializer(serializers.ModelSerializer):
    pedido_id = serializers.PrimaryKeyRelatedField(source='pedido.id', read_only=True)
    caja_id = serializers.IntegerField(source='caja.id', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_anulacion_username = serializers.CharField(source='usuario_anulacion.username', read_only=True)
    metodo_pago_display =serializers.SerializerMethodField()
    
    
    class Meta:
        model = Venta
        fields = ['id', 'pedido','pedido_id','caja', 'caja_id', 'usuario','usuario_username', 'usuario_anulacion_username','monto_total', 'metodo_pago','metodo_pago_display', 'fecha_venta', 'anulada', 'fecha_anulacion', 'creado', 'modificado']
        read_only_fields = ['id', 'fecha_venta','creado', 'modificado','pedido_id','caja_id','usuario_username','usuario_anulacion_username','metodo_pago_display']

    def get_metodo_pago_display(self, obj):
        return obj.get_metodo_pago_display()