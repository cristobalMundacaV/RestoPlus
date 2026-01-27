from rest_framework import serializers
from .models import Mesa,Sala

class SalaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sala
        fields = ['id', 'nombre', 'orden', 'creado', 'modificado']
        read_only_fields = ['id', 'creado', 'modificado']

class MesaSerializer(serializers.ModelSerializer):
    sala_nombre = serializers.CharField(source='sala.nombre', read_only=True)
    
    class Meta:
        model = Mesa
        fields = [
            'id', 'numero', 'sala', 'sala_nombre', 'capacidad',
            'estado', 'pos_x', 'pos_y', 'creado', 'modificado'
        ]
        read_only_fields = ['id', 'creado', 'modificado', 'sala_nombre']

    