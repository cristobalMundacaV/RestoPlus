from rest_framework import serializers
from .models import Categoria, Producto

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'orden', 'activo', 'creado', 'modificado']
        read_only_fields = ['id', 'creado', 'modificado']

class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    tipo_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'descripcion', 'precio', 'tipo','tipo_display',
            'categoria', 'categoria_nombre', 'disponible', 'activo', 'favorito',
            'creado', 'modificado'
        ]
        read_only_fields = ['id', 'creado', 'modificado', 'categoria_nombre', 'tipo_display']
    
    def get_tipo_display(self, obj):
        return obj.get_tipo_display()