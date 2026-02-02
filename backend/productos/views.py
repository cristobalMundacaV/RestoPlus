from rest_framework import viewsets,status,filters
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from core.permissions import EsAdminOEncargado
from core.enums import RolUsuario
from core.mixins import MultiTenancyMixin
from .models import Categoria, Producto
from pedidos.models import DetallePedido
from .serializers import CategoriaSerializer, ProductoSerializer

class CategoriaViewSet(MultiTenancyMixin, viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend,filters.SearchFilter,filters.OrderingFilter]
    filterset_fields = ['activo']
    search_fields = ['nombre']
    ordering_fields = ['orden','nombre']
    ordering = ['-orden']

    def get_queryset(self):
        queryset = Categoria.objects.all()
        user = self.request.user
        if user and user.is_authenticated and user.rol != RolUsuario.ADMIN and user.restaurante:
            return queryset.filter(Q(restaurante=user.restaurante) | Q(restaurante__isnull=True))
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user and getattr(user, 'restaurante', None):
            serializer.save(restaurante=user.restaurante)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def activar(self,request,pk=None):
        categoria = self.get_object()
        categoria.activo = True
        categoria.save(update_fields=['activo'])
        return Response(CategoriaSerializer(categoria).data,status=status.HTTP_200_OK)
    @action(detail=True, methods=['post'])
    def desactivar(self,request,pk=None):
        categoria = self.get_object()
        categoria.activo = False
        categoria.save(update_fields=['activo'])
        return Response(CategoriaSerializer(categoria).data,status=status.HTTP_200_OK)
    
class ProductoViewSet(MultiTenancyMixin, viewsets.ModelViewSet):
    queryset = Producto.objects.select_related('categoria')
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend,filters.SearchFilter,filters.OrderingFilter]
    filterset_fields = ['categoria','disponible','activo','favorito']
    search_fields = ['nombre','descripcion']
    ordering_fields = ['nombre','precio','creado']
    ordering = ['-nombre']

    def get_queryset(self):
        queryset = Producto.objects.select_related('categoria')
        user = self.request.user
        if user and user.is_authenticated and user.rol != RolUsuario.ADMIN and user.restaurante:
            return queryset.filter(Q(restaurante=user.restaurante) | Q(restaurante__isnull=True))
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user and getattr(user, 'restaurante', None):
            serializer.save(restaurante=user.restaurante)
        else:
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        producto = self.get_object()
        if DetallePedido.objects.filter(producto=producto).exists():
            return Response(
                {
                    'detail': 'El producto está asociado a pedidos. Debe desactivarlo.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def activar(self,request,pk=None):
        producto = self.get_object()
        producto.activo = True
        producto.save(update_fields=['activo'])
        return Response(ProductoSerializer(producto).data,status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def desactivar(self,request,pk=None):
        producto = self.get_object()
        producto.activo = False
        producto.save(update_fields=['activo'])
        return Response(ProductoSerializer(producto).data,status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def marcar_favorito(self,request,pk=None):
        producto = self.get_object()
        producto.favorito = not producto.favorito
        producto.save(update_fields=['favorito'])
        return Response(ProductoSerializer(producto).data,status=status.HTTP_200_OK)