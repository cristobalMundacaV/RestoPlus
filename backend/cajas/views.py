from rest_framework import viewsets,status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Caja, MovimientoCaja
from .serializers import CajaSerializer, MovimientoCajaSerializer
from .services import CajaService
from django.core.exceptions import ValidationError

class CajaViewSet(viewsets.ModelViewSet):
    queryset= Caja.objects.all()
    serializer_class = CajaSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            saldo_inicial_raw = request.data.get('saldo_inicial', 0)
            saldo_inicial = 0 if saldo_inicial_raw in (None, '') else int(saldo_inicial_raw)
            caja = CajaService.abrir_caja(request.user, saldo_inicial=saldo_inicial)
            serializer = self.get_serializer(caja)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError):
            return Response({'error': 'Saldo inicial inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['post'])
    def cerrar(self, request, pk=None):
        caja = self.get_object()
        try:
            caja = CajaService.cerrar_caja(caja, request.user)
            serializer = self.get_serializer(caja)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['get'])
    def resumen(self, request, pk=None):
        caja = self.get_object()
        resumen=CajaService.obtener_resumen(caja)
        return Response(resumen) 

