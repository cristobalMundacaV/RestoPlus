from rest_framework import serializers
from .models import Categoria, Producto

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'orden', 'activo', 'creado', 'modificado']
        read_only_fields = ['id', 'creado', 'modificado']

class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    
    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'descripcion', 'precio',
            'categoria', 'categoria_nombre', 'disponible', 'activo', 'favorito',
            'creado', 'modificado'
        ]
        read_only_fields = ['id', 'creado', 'modificado', 'categoria_nombre']

    def create(self, validated_data):
        disponible = validated_data.get('disponible', True)
        validated_data['activo'] = disponible
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'disponible' in validated_data:
            validated_data['activo'] = validated_data['disponible']
        return super().update(instance, validated_data)