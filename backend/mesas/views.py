from rest_framework import viewsets,status,filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Mesa,Sala
from .serializers import MesaSerializer,SalaSerializer

class SalaViewSet(viewsets.ModelViewSet):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter,filters.OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre','orden']
    ordering = ['orden']

class MesaViewSet(viewsets.ModelViewSet):   
    queryset = Mesa.objects.select_related('sala')
    serializer_class = MesaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter,filters.OrderingFilter]
    filterset_fields = ['sala','estado','capacidad']
    search_fields = ['numero']
    ordering_fields = ['numero','estado','capacidad']
    ordering = ['-numero']

    @action(detail=True, methods=['post'])
    def cambiar_estado(self,request,pk=None):
        mesa = self.get_object()
        nuevo_estado = request.data.get('estado')
        estados_validados = [choice[0] for choice in Mesa._meta.get_field('estado').choices]
        if nuevo_estado not in estados_validados:
            return Response(
                {'error': f'Estado inválido. Validos: {estados_validados}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        mesa.estado = nuevo_estado
        mesa.save(update_fields=['estado'])
        return Response(MesaSerializer(mesa).data,status=status.HTTP_200_OK)