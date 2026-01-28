from rest_framework import serializers
from .models import Ingrediente,Receta,MovimientoInventario

class IngredienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingrediente
        fields = ['id', 'nombre', 'unidad_medida', 'stock_actual', 'stock_minimo','es_critico', 'creado', 'modificado']
        read_only_fields = ['id', 'creado', 'modificado']

class RecetaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True) 
    ingrediente_nombre = serializers.CharField(source='ingrediente.nombre', read_only=True)
    class Meta:
        model = Receta
        fields = ['id', 'producto', 'producto_nombre', 'ingrediente', 'ingrediente_nombre', 'cantidad', 'creado', 'modificado']
        read_only_fields = ['id', 'creado', 'modificado', 'producto_nombre', 'ingrediente_nombre']

class MovimientoInventarioSerializer(serializers.ModelSerializer):
    ingrediente_nombre =serializers.CharField(source='ingrediente.nombre', read_only=True)
    tipo_movimiento_display = serializers.SerializerMethodField()
    class Meta:
        model = MovimientoInventario
        fields = ['id', 'ingrediente', 'ingrediente_nombre', 'cantidad', 'tipo_movimiento', 'tipo_movimiento_display', 'motivo', 'fecha_movimiento', 'venta', 'creado', 'modificado']
        read_only_fields = ['id', 'fecha_movimiento', 'creado', 'modificado', 'ingrediente_nombre', 'tipo_movimiento_display']

    def get_tipo_movimiento_display(self, obj):
        return obj.get_tipo_movimiento_display()