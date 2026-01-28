from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalaViewSet, MesaViewSet

router = DefaultRouter()
router.register(r'salas', SalaViewSet, basename='sala')
router.register(r'mesas', MesaViewSet, basename='mesa')

urlpatterns = [
    path('', include(router.urls)),
]
