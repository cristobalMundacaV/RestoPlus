from rest_framework import viewsets, filters,permissions
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Auditoria
from .serializers import AuditoriaSerializer

class AdminOrNot(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.rol == 'ADMIN' or obj.usuario == request.user
    
class AuditoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Auditoria.objects.select_related('usuario').order_by('-fecha_creacion')
    serializer_class = AuditoriaSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['accion', 'modulo', 'usuario','fecha_creacion']
    search_fields = ['descripcion', 'usuario__username']
    ordering_fields = ['fecha_creacion', 'accion', 'modulo']
    ordering = ['-fecha_creacion']
