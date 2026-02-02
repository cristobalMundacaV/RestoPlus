from django.db import models

class TipoInsumo(models.TextChoices):
    CRITICO = 'CRITICO', 'Crítico'
    GENERAL = 'GENERAL', 'General'

class UnidadMedida(models.TextChoices):
    KILOGRAMOS = 'KG', 'Kilogramos'
    GRAMOS = 'G', 'Gramos'
    LITROS = 'L', 'Litros'
    MILILITROS = 'ML', 'Mililitros'
    UNIDAD = 'UNIDAD', 'Unidad'

class TipoMovimientoInventario(models.TextChoices):
    INGRESO = 'INGRESO', 'Ingreso'
    EGRESO = 'EGRESO', 'Egreso'
    AJUSTE = 'AJUSTE', 'Ajuste'

