from django.db import models

class TipoMovimientoCaja(models.TextChoices):
    INGRESO = 'INGRESO', 'Ingreso'
    EGRESO = 'EGRESO', 'Egreso'
