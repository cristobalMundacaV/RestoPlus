from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .services import (
    ventas_por_dia,
    ventas_por_rango,
    productos_mas_vendidos,
    productos_menos_vendidos,
    ventas_por_metodo_pago,
    ingredientes_stock_critico,
    resumen_caja,
    rentabilidad_por_producto,
    perdidas_inventario,
    tendencias_venta,
)


def _parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%d-%m-%Y").date()
    except (TypeError, ValueError):
        return None


class VentasPorDiaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fecha_str = request.query_params.get('fecha')

        if not fecha_str:
            return Response({"error": "La fecha es requerida (DD-MM-YYYY)"}, status=400)

        try:
            fecha = datetime.strptime(fecha_str, "%d-%m-%Y").date()
        except ValueError:
            return Response({"error": "Formato inválido. Use DD-MM-YYYY"}, status=400)

        data = ventas_por_dia(fecha)
        return Response(data)


class VentasPorRangoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fecha_inicio_str = request.query_params.get('inicio')
        fecha_fin_str = request.query_params.get('fin')

        if not fecha_inicio_str or not fecha_fin_str:
            return Response({"error": "Las fechas inicio y fin son requeridas (DD-MM-YYYY)"}, status=400)

        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, "%d-%m-%Y").date()
            fecha_fin = datetime.strptime(fecha_fin_str, "%d-%m-%Y").date()
        except ValueError:
            return Response({"error": "Formato inválido. Use DD-MM-YYYY"}, status=400)

        data = ventas_por_rango(fecha_inicio, fecha_fin)
        return Response(data)


class ProductosMasVendidosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        top = int(request.query_params.get('top', 10))
        data = productos_mas_vendidos(top)
        return Response(data)


class ProductosMenosVendidosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        top = int(request.query_params.get('top', 10))
        data = productos_menos_vendidos(top)
        return Response(data)


class IngredientesStockCriticoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = ingredientes_stock_critico().values(
            'id', 'nombre', 'stock_actual', 'stock_minimo'
        )
        return Response(data)


class VentasPorMetodoPagoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = ventas_por_metodo_pago()
        return Response(data)


class ResumenCajaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = resumen_caja()
        return Response(data)


class RentabilidadPorProductoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fecha_inicio = _parse_date(request.query_params.get('inicio'))
        fecha_fin = _parse_date(request.query_params.get('fin'))

        data = rentabilidad_por_producto(fecha_inicio, fecha_fin)
        return Response(data)


class PerdidasInventarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fecha_inicio = _parse_date(request.query_params.get('inicio'))
        fecha_fin = _parse_date(request.query_params.get('fin'))

        data = perdidas_inventario(fecha_inicio, fecha_fin)
        return Response(data)


class TendenciasVentaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dias = request.query_params.get('dias')
        try:
            dias = int(dias) if dias else 30
        except ValueError:
            return Response({"error": "El parámetro dias debe ser numérico"}, status=400)

        data = tendencias_venta(dias)
        return Response(data)
