from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IngredienteViewSet, RecetaViewSet, MovimientoInventarioViewSet

router = DefaultRouter()
router.register(r'ingredientes', IngredienteViewSet, basename='ingrediente')
router.register(r'recetas', RecetaViewSet, basename='receta')
router.register(r'movimientos-inventario', MovimientoInventarioViewSet, basename='movimiento-inventario')

urlpatterns = [
    path('', include(router.urls)),
]