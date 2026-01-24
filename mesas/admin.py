from django.contrib import admin
from .models import Mesa

admin.register(Mesa)
class MesaAdmin(admin.ModelAdmin):
    list_display = ('numero', 'capacidad', 'estado')
    search_fields = ('numero', 'estado')
    list_filter = ('estado',)
    