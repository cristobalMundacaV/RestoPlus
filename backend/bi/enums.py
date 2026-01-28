from django.db import models

class FranjaHoraria(models.TextChoices):
    MANANA = 'MANANA', 'Mañana (08:00 - 12:00)'
    TARDE = 'TARDE', 'Tarde (12:00 - 15:00)'
    NOCHE = 'NOCHE', 'Noche (15:00 - 24:00)'
    MADRUGADA = 'MADRUGADA', 'Madrugada (00:00 - 08:00)'