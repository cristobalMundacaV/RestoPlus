from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RestauranteViewSet, PlanViewSet, RestauranteModulosViewSet
router = DefaultRouter()
router.register(r'restaurantes', RestauranteViewSet, basename='restaurante')
router.register(r'planes', PlanViewSet, basename='plan')
router.register(r'restaurante-modulos', RestauranteModulosViewSet, basename='restaurante-modulos')
urlpatterns = [
    path('', include(router.urls)),
]