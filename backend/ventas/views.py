from rest_framework import viewsets,status,filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Venta
from .serializers import VentaSerializer
from .services import crear_venta, anular_venta
from pedidos.models import Pedido
from cajas.models import Caja
from django.core.exceptions import ValidationError

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.select_related('pedido', 'caja', 'usuario', 'usuario_anulacion')
    serializer_class = VentaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['caja', 'usuario', 'anulada', 'metodo_pago']
    search_fields = ['pedido__id', 'id']
    ordering_fields = ['monto_total', 'fecha_venta', 'creado']
    ordering = ['-fecha_venta']

    def create(self, request, *args, **kwargs):
        pedido_id = request.data.get('pedido')
        caja_id = request.data.get('caja')
        metodo_pago = request.data.get('metodo_pago')

        if not pedido_id or not caja_id or not metodo_pago:
            return Response(
                {'error': 'pedido, caja y metodo_pago son obligatorios'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            pedido = Pedido.objects.get(pk=pedido_id)
            caja = Caja.objects.get(pk=caja_id)
            venta = crear_venta(pedido, caja, request.user, metodo_pago)
            serializer = self.get_serializer(venta)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Pedido.DoesNotExist:
            return Response({'error': 'Pedido no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Caja.DoesNotExist:
            return Response({'error': 'Caja no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def anular(self, request, pk=None):
        venta = self.get_object()
        try:
            anular_venta(venta, request.user)
            return Response(VentaSerializer(venta).data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def boleta(self, request, pk=None):
        venta = self.get_object()
        # Generar si no existe
        # Retornar PDF en response
        pass    