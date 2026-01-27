from rest_framework import serializers
from .models import Plan, Restaurante, RestauranteModulos
from core.models import Modulo
from core.serializers import ModuloSerializer

class ModuloMinimoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modulo
        fields = ['id', 'nombre']

class PlanSerializer(serializers.ModelSerializer):
    modulos = ModuloSerializer(many=True, read_only=True)
    class Meta:
        model = Plan
        fields = ['id', 'nombre', 'descripcion','modulos']
        read_only_fields = ['id','modulos']

class RestauranteSerializer(serializers.ModelSerializer):
    plan_nombre = serializers.CharField(source='plan.nombre', read_only=True)
    
    class Meta:
        model = Restaurante
        fields = [
            'id', 'nombre', 'razon_social', 'rut', 'direccion',
            'activo', 'plan', 'plan_nombre', 'creado', 'modificado'
        ]
        read_only_fields = ['id', 'creado', 'modificado', 'plan_nombre']

class RestauranteModulosSerializer(serializers.ModelSerializer):
    modulo_nombre = serializers.CharField(source='modulo.nombre', read_only=True)
    restaurante_nombre = serializers.CharField(source='restaurante.nombre', read_only=True)

    class Meta:
        model = RestauranteModulos
        fields = ['id', 'restaurante','restaurante_nombre', 'modulo','modulo_nombre', 'activo','fecha_activacion',]
        read_only_fields = ['id', 'restaurante_nombre', 'modulo_nombre' ,'fecha_activacion']  