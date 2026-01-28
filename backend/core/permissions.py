from rest_framework import permissions
from .enums import RolUsuario

class EsAdmin(permissions.BasePermission):
    """Permiso para usuarios administradores"""
    message = 'Solo los administradores pueden realizar esta acción.'

    def has_permission(self, request, view):
        return request.user and request.user.rol == RolUsuario.ADMIN
    
class EsAdminOEncargado(permissions.BasePermission):
    """Permiso para administradores o encargados"""
    message = 'Solo los administradores o encargados pueden realizar esta acción.'

    def has_permission(self, request, view):
        return request.user and request.user.rol in [RolUsuario.ADMIN, RolUsuario.ENCARGADO]
    
class EsMeseroOSuperior(permissions.BasePermission):
    """Permiso para meseros, encargados o administradores"""
    message = 'No tienes permisos para realizar esta acción.'

    def has_permission(self, request, view):
        return request.user and request.user.rol in [
            RolUsuario.ADMIN,
            RolUsuario.ENCARGADO,
            RolUsuario.MESERO,
            RolUsuario.BARTENDER,
        ]
    
class EsCocineroOAdmin(permissions.BasePermission):
    message = 'Solo los cocineros o administradores pueden realizar esta acción.'
    def has_permission(self, request, view):
        return request.user and request.user.rol in [
            RolUsuario.ADMIN,
            RolUsuario.COCINERO,
        ]
    
class EsEncargadoOAdmin(permissions.BasePermission):
    message = 'Solo los encargados o administradores pueden realizar esta acción.'
    def has_permission(self, request, view):
        return request.user and request.user.rol in [
            RolUsuario.ADMIN,
            RolUsuario.ENCARGADO,
        ]
    
class EsPropietarioOAdmin(permissions.BasePermission):
    message = 'Solo los propietarios o administradores pueden realizar esta acción.'
    def has_object_permission(self, request, view,obj):
        if request.user and request.user.rol == RolUsuario.ADMIN:
            return True
        return obj.propietario == request.user