from rest_framework import viewsets,status,filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Pedido, DetallePedido, TrasladoMesa, EstadoPedido
from .serializers import PedidoSerializer, DetallePedidoSerializer, TrasladoMesaSerializer

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.select_related('mesa', 'camarero')
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['mesa', 'camarero', 'estado']
    search_fields = ['mesa__numero', 'id']
    ordering_fields = ['fecha_pedido', 'creado']
    ordering = ['-fecha_pedido']

    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        pedido = self.get_object()
        nuevo_estado = request.data.get('estado')
        estados_validados = [choice[0] for choice in EstadoPedido.choices]
        if nuevo_estado not in estados_validados:
            return Response(
                {'error': f'Estado inválido. Válidos: {estados_validados}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        pedido.estado = nuevo_estado
        pedido.save(update_fields=['estado'])
        return Response(PedidoSerializer(pedido).data, status=status.HTTP_200_OK)
    
class DetallePedidoViewSet(viewsets.ModelViewSet):
    queryset = DetallePedido.objects.select_related('pedido', 'producto')
    serializer_class = DetallePedidoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pedido', 'producto']
    search_fields = ['producto__nombre']
    ordering_fields = ['cantidad', 'precio_unitario', 'creado']
    ordering = ['-creado']

class TrasladoMesaViewSet(viewsets.ModelViewSet):
    queryset = TrasladoMesa.objects.select_related('pedido', 'mesa_origen', 'mesa_destino', 'usuario')
    serializer_class = TrasladoMesaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pedido','mesa_origen', 'mesa_destino', 'usuario']
    search_fields = ['pedido__id', 'mesa_origen__numero', 'mesa_destino__numero']
    ordering_fields = ['creado']
    ordering = ['-creado']