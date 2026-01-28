from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from .views import UsuarioViewSet, ModuloViewSet

router=DefaultRouter()
router.register(r'usuarios',UsuarioViewSet,basename='usuario')
router.register(r'modulos',ModuloViewSet,basename='modulo')

urlpatterns=[
    path('',include(router.urls)),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
]