from rest_framework import viewsets,status,filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Venta
from .serializers import VentaSerializer
from django.utils import timezone

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.select_related('pedido', 'caja', 'usuario', 'usuario_anulacion')
    serializer_class = VentaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['caja', 'usuario', 'anulada', 'metodo_pago']
    search_fields = ['pedido__id', 'id']
    ordering_fields = ['monto_total', 'fecha_venta', 'creado']
    ordering = ['-fecha_venta']

    @action(detail=True, methods=['post'])
    def anular(self, request, pk=None):
        venta = self.get_object()
        if venta.anulada:
            return Response(
                {'error': 'La venta ya está anulada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        venta.anulada = True
        venta.usuario_anulacion = request.user
        venta.fecha_anulacion = timezone.now()
        venta.save(update_fields=['anulada', 'usuario_anulacion', 'fecha_anulacion'])
        return Response(VentaSerializer(venta).data, status=status.HTTP_200_OK)