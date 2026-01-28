from rest_framework import serializers

from core.models import Usuario
from .models import Caja,MovimientoCaja
from django.db.models import Sum

class UsuarioMinimoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email']

class MovimientoCajaSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = MovimientoCaja
        fields = ['id', 'tipo', 'tipo_display', 'monto', 'descripcion', 'fecha_movimiento']
        read_only_fields = ['fecha_movimiento']

class CajaSerializer(serializers.ModelSerializer):
    usuario_apertura = UsuarioMinimoSerializer(read_only=True)
    usuario_cierre = UsuarioMinimoSerializer(read_only=True)
    total_ingresos = serializers.SerializerMethodField()
    total_egresos = serializers.SerializerMethodField()
    saldo_actual = serializers.SerializerMethodField()

    class Meta:
        model = Caja
        fields = [
            'id', 'usuario_apertura', 'usuario_cierre',
            'saldo_inicial', 'total_ingresos', 'total_egresos',
            'saldo_actual', 'abierta', 'fecha_apertura', 'fecha_cierre'
        ]
        read_only_fields = fields

    def get_total_ingresos(self, obj):
            return obj.movimientos.filter(tipo='INGRESO').aggregate(Sum('monto'))['monto__sum'] or 0

    def get_total_egresos(self, obj):
            return obj.movimientos.filter(tipo='EGRESO').aggregate(Sum('monto'))['monto__sum'] or 0

    def get_saldo_actual(self, obj):
            total_ingresos = self.get_total_ingresos(obj)
            total_egresos = self.get_total_egresos(obj)
            return obj.saldo_inicial + total_ingresos - total_egresos