from django.db import models

class TipoMovimientoCaja(models.TextChoices):
    INGRESO = 'INGRESO', 'Ingreso'
    EGRESO = 'EGRESO', 'Egreso'
    VENTA = 'VENTA', 'Venta'
    AJUSTE = 'AJUSTE', 'Ajuste'

class EstadoCaja(models.TextChoices):
    ABIERTA = 'ABIERTA', 'Abierta'
    CERRADA = 'CERRADA', 'Cerrada'