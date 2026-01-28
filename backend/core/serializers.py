from rest_framework import serializers
from .models import Usuario, Modulo

class UsuarioMinimoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email']

class UsuarioSerializer(serializers.ModelSerializer):
    restaurante_nombre = serializers.CharField(source='restaurante.nombre', read_only=True)
    rol_display = serializers.CharField(source='get_rol_display', read_only=True)
    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'rol', 'rol_display', 'is_active', 'restaurante', 'restaurante_nombre','date_joined'
        ]
        read_only_fields = ['id','date_joined','restaurante_nombre','rol_display']

class ModuloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modulo
        fields = ['id', 'nombre', 'descripcion']
        read_only_fields = ['id']