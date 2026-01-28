from rest_framework import viewsets,status,filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Restaurante, Plan, RestauranteModulos
from .serializers import RestauranteSerializer, PlanSerializer, RestauranteModulosSerializer

class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'descripcion']

class RestauranteViewSet(viewsets.ModelViewSet):
    queryset = Restaurante.objects.select_related('plan')
    serializer_class = RestauranteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter,filters.OrderingFilter]
    filterset_fields = ['activo', 'plan']
    search_fields = ['nombre', 'razon_social', 'rut']
    ordering_fields = ['nombre', 'creado']
    ordering = ['-creado']

    @action(detail=True, methods=['post'])
    def activar(self,request,pk=None):
        restaurante = self.get_object()
        restaurante.activo = True
        restaurante.save(update_fields=['activo'])
        return Response(RestauranteSerializer(restaurante).data,status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def desactivar(self,request,pk=None):
        restaurante = self.get_object()
        restaurante.activo = False
        restaurante.save(update_fields=['activo'])
        return Response(RestauranteSerializer(restaurante).data,status=status.HTTP_200_OK)

class RestauranteModulosViewSet(viewsets.ModelViewSet):
    queryset = RestauranteModulos.objects.select_related('restaurante','modulo')
    serializer_class = RestauranteModulosSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['restaurante','modulo','activo']

