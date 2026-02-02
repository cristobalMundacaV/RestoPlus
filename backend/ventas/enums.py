from django.db import models

class MetodoPago(models.TextChoices):
    EFECTIVO = 'EFECTIVO', 'Efectivo'
    TARJETA_CREDITO = 'TARJETA_CREDITO', 'Tarjeta de Crédito'
    TARJETA_DEBITO = 'TARJETA_DEBITO', 'Tarjeta de Débito'
    TRANSFERENCIA = 'TRANSFERENCIA', 'Transferencia Bancaria'
    MIXTOS = 'MIXTOS', 'Pagos Mixtos'

class EstadoBoleta(models.TextChoices):
    EMITIDA = 'EMITIDA', 'Emitida'
    ANULADA = 'ANULADA', 'Anulada'
    PENDIENTE = 'PENDIENTE', 'Pendiente'