from django.urls import path
from .views import(
    VentasPorDiaView,
    VentasPorRangoView,
    ProductosMasVendidosView,
    ProductosMenosVendidosView,
    IngredientesStockCriticoView,
    VentasPorMetodoPagoView,
    ResumenCajaView,
    RentabilidadPorProductoView,
    PerdidasInventarioView,
    TendenciasVentaView,
)

urlpatterns = [
    path('ventas/por-dia/', VentasPorDiaView.as_view(), name='ventas_por_dia'),
    path('ventas/por-rango/', VentasPorRangoView.as_view(), name='ventas_por_rango'),
    path('productos/mas-vendidos/', ProductosMasVendidosView.as_view(), name='productos_mas_vendidos'),
    path('productos/menos-vendidos/', ProductosMenosVendidosView.as_view(), name='productos_menos_vendidos'),
    path('ingredientes/stock-critico/', IngredientesStockCriticoView.as_view(), name='ingredientes_stock_critico'),
    path('ventas/por-metodo-pago/', VentasPorMetodoPagoView.as_view(), name='ventas_por_metodo_pago'),
    path('caja/resumen/', ResumenCajaView.as_view(), name='resumen_caja'),
    path('rentabilidad-por-producto/', RentabilidadPorProductoView.as_view(), name='rentabilidad_por_producto'),
    path('perdidas-inventario/', PerdidasInventarioView.as_view(), name='perdidas_inventario'),
    path('tendencias-venta/', TendenciasVentaView.as_view(), name='tendencias_venta'),
]