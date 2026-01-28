from rest_framework import viewsets,status,filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Ingrediente, Receta, MovimientoInventario
from .serializers import IngredienteSerializer, RecetaSerializer, MovimientoInventarioSerializer
from django.db.models import F

class IngredienteViewSet(viewsets.ModelViewSet):
    queryset = Ingrediente.objects.all()
    serializer_class = IngredienteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['es_critico']
    search_fields = ['nombre','unidad_medida']
    ordering_fields = ['nombre', 'stock_actual', 'stock_minimo']
    ordering = ['-nombre']

    @action(detail=False, methods=['get'])
    def bajo_stock(self, request):
        ingredientes_bajo_stock = Ingrediente.objects.filter(stock_actual__lte=F('stock_minimo'))
        serializer = self.get_serializer(ingredientes_bajo_stock, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def ajustar_stock(self, request, pk=None):
        ingrediente = self.get_object()
        nuevo_stock = request.data.get('nuevo_stock')
        if nuevo_stock is None:
            return Response(
                {'error': 'El campo nuevo stock es requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            nuevo_stock = float(nuevo_stock)
        except ValueError:
            return Response(
                {'error': 'El campo nuevo stock debe ser un número válido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if nuevo_stock < 0:
            return Response(
                {'error': 'El campo nuevo stock no puede ser negativo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        ingrediente.stock_actual = nuevo_stock
        ingrediente.save(update_fields=['stock_actual'])
        ingrediente.refresh_from_db()
        serializer = self.get_serializer(ingrediente)
        return Response(serializer.data, status=status.HTTP_200_OK) 
    
class RecetaViewSet(viewsets.ModelViewSet):
    queryset = Receta.objects.select_related('producto', 'ingrediente')
    serializer_class = RecetaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['producto', 'ingrediente']
    search_fields = ['producto__nombre', 'ingrediente__nombre']
    ordering_fields = ['cantidad','creado']
    ordering = ['-producto__nombre']
    
class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.select_related('ingrediente', 'venta')
    serializer_class = MovimientoInventarioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ingrediente', 'tipo_movimiento', 'venta']
    search_fields = ['ingrediente__nombre', 'motivo']
    ordering_fields = ['fecha_movimiento', 'cantidad']
    ordering = ['-fecha_movimiento']