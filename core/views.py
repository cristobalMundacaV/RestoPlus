from rest_framework import viewsets,status,filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Usuario, Modulo
from .serializers import UsuarioSerializer, ModuloSerializer, UsuarioMinimoSerializer
from .enums import RolUsuario

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['rol', 'is_active', 'restaurante']

    search_fields = ['username', 'email', 'first_name']
    ordering_fields = ['username', 'date_joined']
    ordering = ['-date_joined']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UsuarioSerializer
        elif self.action == 'list':
            return UsuarioMinimoSerializer
        return UsuarioSerializer
    
    @action(detail=True,methods=['post'])
    def cambiar_rol(self,request,pk=None):
        usuario = self.get_object()
        nuevo_rol = request.data.get('rol')
        if nuevo_rol not in [choice[0] for choice in RolUsuario.choices]:
            return Response({'error':'Rol inválido'},status=status.HTTP_400_BAD_REQUEST)
        usuario.rol = nuevo_rol
        usuario.save(update_fields=['rol'])
        return Response({'status':'Rol actualizado'},status=status.HTTP_200_OK)
    
class ModuloViewSet(viewsets.ReadOnlyModelViewSet):
        queryset = Modulo.objects.all()
        serializer_class = ModuloSerializer
        permission_classes = [IsAuthenticated]

        filter_backends = [filters.SearchFilter]
        search_fields = ['nombre', 'descripcion']