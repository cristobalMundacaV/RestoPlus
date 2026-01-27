from django.db.models import F
from django.db.models import Sum,Count
from ventas.models import Venta
from pedidos.models import DetallePedido
from inventario.models import Ingrediente
from cajas.models import MovimientoCaja
from cajas.enums import TipoMovimientoCaja

def ventas_por_dia(fecha):
    return Venta.objects.filter(
        fecha_venta__date=fecha,
        anulada=False
    ).aggregate(total=Sum('monto_total'))

def ventas_por_rango(fecha_inicio, fecha_fin):
    return Venta.objects.filter(
        fecha_venta__date__range=(fecha_inicio, fecha_fin),
        anulada=False
    ).aggregate(total=Sum('monto_total'))

def productos_mas_vendidos(top=10):
    return DetallePedido.objects.values(
        'producto__nombre'
    ).annotate(
        total_vendido=Sum('cantidad')
    ).order_by('-total_vendido')[:top]

def productos_menos_vendidos(top=10):
    return DetallePedido.objects.values(
        'producto__nombre'
    ).annotate(
        total_vendido=Sum('cantidad')
    ).order_by('total_vendido')[:top]

def ingredientes_stock_critico():
    return Ingrediente.objects.filter(
        stock_actual__lte=F('stock_minimo')
    )

def ventas_por_metodo_pago():
    return Venta.objects.filter(
        anulada=False
    ).values(
        'metodo_pago'
    ).annotate(
        total=Sum('monto_total'),
        cantidad=Count('id')
    )

def resumen_caja():
    ingresos = MovimientoCaja.objects.filter(
        tipo=TipoMovimientoCaja.INGRESO,
    ).aggregate(total=Sum('monto'))

    egresos = MovimientoCaja.objects.filter(
        tipo=TipoMovimientoCaja.EGRESO,
    ).aggregate(total=Sum('monto'))

    return {
        'ingresos': ingresos['total'] or 0,
        'egresos': egresos['total'] or 0,
        'saldo': (ingresos['total'] or 0) - (egresos['total'] or 0)
    }