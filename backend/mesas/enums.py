from django.db import models

class EstadoMesa(models.TextChoices):
    DISPONIBLE = 'DISPONIBLE', 'Disponible'
    OCUPADA = 'OCUPADA', 'Ocupada'
    RESERVADA = 'RESERVADA', 'Reservada'
    EN_LIMPIEZA = 'EN_LIMPIEZA', 'En Limpieza'
    