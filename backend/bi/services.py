from datetime import datetime, timedelta
from django.db.models import F, Sum, Count, Value, FloatField, ExpressionWrapper, Case, When
from django.db.models.functions import TruncDate
from ventas.models import Venta
from pedidos.models import DetallePedido
from inventario.models import Ingrediente, MovimientoInventario
from cajas.models import MovimientoCaja
from cajas.enums import TipoMovimientoCaja

def ventas_por_dia(fecha):
    return Venta.objects.filter(
        fecha_venta__date=fecha,
        anulada=False
    ).aggregate(total=Sum('monto_total'))

def ventas_por_rango(fecha_inicio, fecha_fin):
    return list(
        Venta.objects.filter(
            fecha_venta__date__range=(fecha_inicio, fecha_fin),
            anulada=False
        ).annotate(
            fecha=TruncDate('fecha_venta')
        ).values('fecha').annotate(
            total=Sum('monto_total'),
            cantidad=Count('id')
        ).order_by('fecha')
    )

def productos_mas_vendidos(top=10):
    return DetallePedido.objects.filter(
        pedido__venta__anulada=False
    ).values(
        'producto__nombre'
    ).annotate(
        total_vendido=Sum('cantidad')
    ).order_by('-total_vendido')[:top]

def productos_menos_vendidos(top=10):
    return DetallePedido.objects.filter(
        pedido__venta__anulada=False
    ).values(
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

def rentabilidad_por_producto(fecha_inicio=None, fecha_fin=None):
    if not fecha_inicio:
        fecha_inicio = datetime.now().date() - timedelta(days=30)
    if not fecha_fin:
        fecha_fin = datetime.now().date()

    ingresos_expr = ExpressionWrapper(
        F('cantidad') * F('precio_unitario'),
        output_field=FloatField()
    )

    data = DetallePedido.objects.filter(
        pedido__venta__fecha_venta__date__range=(fecha_inicio, fecha_fin),
        pedido__venta__anulada=False
    ).values('producto__nombre').annotate(
        cantidad=Sum('cantidad'),
        ingresos=Sum(ingresos_expr),
        costo_produccion=Value(0.0, output_field=FloatField()),
    )

    data = data.annotate(
        ganancia=ExpressionWrapper(
            F('ingresos') - F('costo_produccion'),
            output_field=FloatField()
        ),
        margen=Case(
            When(ingresos__gt=0, then=ExpressionWrapper(F('ganancia') * 100.0 / F('ingresos'), output_field=FloatField())),
            default=Value(0.0, output_field=FloatField()),
            output_field=FloatField(),
        )
    ).order_by('-ingresos')

    return list(data)

def perdidas_inventario(fecha_inicio=None, fecha_fin=None):
    if not fecha_inicio:
        fecha_inicio = datetime.now().date() - timedelta(days=30)
    if not fecha_fin:
        fecha_fin = datetime.now().date()

    perdidas = MovimientoInventario.objects.filter(
        tipo_movimiento='EGRESO',
        venta__isnull=True,
        fecha_movimiento__date__range=(fecha_inicio, fecha_fin)
    ).values('ingrediente__nombre').annotate(
        cantidad_perdida=Sum('cantidad')
    ).order_by('-cantidad_perdida')

    return list(perdidas)

def tendencias_venta(dias=30):
    fecha_inicio = datetime.now().date() - timedelta(days=dias)

    datos = Venta.objects.filter(
        fecha_venta__date__gte=fecha_inicio,
        anulada=False
    ).annotate(
        fecha=TruncDate('fecha_venta')
    ).values('fecha').annotate(
        total=Sum('monto_total'),
        cantidad=Count('id')
    ).order_by('fecha')

    return list(datos)