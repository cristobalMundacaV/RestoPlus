from rest_framework import serializers
from .models import Auditoria
from core.models import Usuario


class UsuarioMinimoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email']


class AuditoriaSerializer(serializers.ModelSerializer):
    usuario = UsuarioMinimoSerializer(read_only=True)

    accion_display = serializers.CharField(
        source='get_accion_display',
        read_only=True
    )
    modulo_display = serializers.CharField(
        source='get_modulo_display',
        read_only=True
    )

    class Meta:
        model = Auditoria
        fields = [
            'id',
            'accion',
            'accion_display',
            'modulo',
            'modulo_display',
            'descripcion',
            'usuario',
            'fecha_creacion',
        ]
        read_only_fields = fields
