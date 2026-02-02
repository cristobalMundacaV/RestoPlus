from django.contrib import admin
from .models import Venta, Boleta

@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ['id', 'numero_pedido', 'monto_total', 'metodo_pago', 'fecha_venta', 'anulada']
    list_filter = ['fecha_venta', 'metodo_pago', 'anulada', 'caja']
    search_fields = ['pedido__id', 'id']
    readonly_fields = ['fecha_venta', 'creado', 'modificado']
    ordering = ['-fecha_venta']
    
    def numero_pedido(self, obj):
        return obj.pedido.id
    numero_pedido.short_description = 'Pedido'

@admin.register(Boleta)
class BolletaAdmin(admin.ModelAdmin):
    list_display = ['numero', 'numero_venta', 'estado', 'fecha_emision']
    list_filter = ['estado', 'fecha_emision']
    search_fields = ['numero', 'venta__id']
    readonly_fields = ['fecha_emision', 'creado', 'modificado']
    ordering = ['-fecha_emision']
    
    def numero_venta(self, obj):
        return obj.venta.id
    numero_venta.short_description = 'Venta'
