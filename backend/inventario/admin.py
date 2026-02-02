from django.contrib import admin
from .models import Ingrediente, Receta, MovimientoInventario

@admin.register(Ingrediente)
class IngredienteAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'stock_actual', 'stock_minimo', 'unidad_medida', 'es_critico']
    list_filter = ['es_critico', 'creado']
    search_fields = ['nombre']
    readonly_fields = ['creado', 'modificado']
    fieldsets = (
        ('Información general', {
            'fields': ('nombre', 'unidad_medida')
        }),
        ('Stock', {
            'fields': ('stock_actual', 'stock_minimo', 'es_critico')
        }),
        ('Auditoría', {
            'fields': ('creado', 'modificado'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Receta)
class RecetaAdmin(admin.ModelAdmin):
    list_display = ['producto', 'ingrediente', 'cantidad']
    list_filter = ['producto', 'creado']
    search_fields = ['producto__nombre', 'ingrediente__nombre']
    readonly_fields = ['creado', 'modificado']

@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ['ingrediente', 'tipo_movimiento', 'cantidad', 'fecha_movimiento']
    list_filter = ['tipo_movimiento', 'fecha_movimiento']
    search_fields = ['ingrediente__nombre', 'motivo']
    readonly_fields = ['fecha_movimiento', 'creado', 'modificado']
    ordering = ['-fecha_movimiento']
