from django.db import models

class RolUsuario(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrador'
    ENCARGADO = 'ENCARGADO', 'Encargado'
    MESERO = 'MESERO', 'Mesero'
    COCINERO = 'COCINERO', 'Cocinero'
    BARTENDER = 'BARTENDER', 'Bartender'