"""
Mixins para aplicar lógica de multitenancy y filtrado en ViewSets.
"""
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from core.enums import RolUsuario


class MultiTenancyMixin:
    """
    Mixin que filtra querysets por restaurante del usuario.
    
    - ADMINs pueden ver todos los datos de todos los restaurantes
    - Otros usuarios solo ven datos de su restaurante
    
    Define 'restaurante_filter_field' en el ViewSet para especificar
    el nombre del campo FK a restaurante (default: 'restaurante')
    
    Ejemplo:
        class MesaViewSet(MultiTenancyMixin, ViewSet):
            restaurante_filter_field = 'sala__restaurante'  # relación indirecta
    """
    
    restaurante_filter_field = 'restaurante'  # Default: FK directo
    
    def get_queryset(self):
        """
        Filtra queryset por restaurante del usuario.
        Los ADMINs ven todo. Otros usuarios ven solo su restaurante.
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        # ADMINs ven todo
        if user and user.is_authenticated and user.rol == RolUsuario.ADMIN:
            return queryset
        
        # Otros usuarios ven solo su restaurante
        if user and user.is_authenticated and user.restaurante:
            filter_kwargs = {self.restaurante_filter_field: user.restaurante}
            return queryset.filter(**filter_kwargs)
        
        # Usuario sin restaurante asignado: lista vacía
        return queryset.none()


class MultiTenancyObjectPermissionMixin:
    """
    Mixin para verificar que el usuario tiene acceso al objeto específico.
    
    - ADMINs siempre tienen acceso
    - Otros usuarios solo acceden objetos de su restaurante
    
    Define 'restaurante_filter_field' igual que MultiTenancyMixin.
    """
    
    restaurante_filter_field = 'restaurante'
    
    def check_object_tenancy(self, obj):
        """
        Verifica si el usuario tiene acceso al objeto.
        Retorna True si tiene acceso, False si no.
        """
        user = self.request.user
        
        if not user or not user.is_authenticated:
            return False
        
        # ADMINs siempre tienen acceso
        if user.rol == RolUsuario.ADMIN:
            return True
        
        # Obtener el restaurante del objeto
        obj_restaurante = obj
        for field in self.restaurante_filter_field.split('__'):
            obj_restaurante = getattr(obj_restaurante, field, None)
            if obj_restaurante is None:
                return False
        
        # Verificar que el restaurante del objeto es el del usuario
        return obj_restaurante.id == user.restaurante.id
    
    def get_object(self):
        """
        Obtiene el objeto y verifica permisos de multitenancy.
        """
        obj = super().get_object()
        
        if not self.check_object_tenancy(obj):
            self.permission_denied(
                self.request,
                message='No tiene acceso a este recurso (restaurante diferente)'
            )
        
        return obj
