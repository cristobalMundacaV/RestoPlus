from rest_framework import viewsets,status,filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from core.permissions import EsAdminOEncargado
from core.mixins import MultiTenancyMixin
from .models import Categoria, Producto
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
    filterset_fields = ['categoria','tipo','disponible','activo','favorito']
    search_fields = ['nombre','descripcion']
    ordering_fields = ['nombre','precio','creado']
    ordering = ['-nombre']

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