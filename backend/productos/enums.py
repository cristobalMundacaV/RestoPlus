from django.db import models

class CategoriaProducto(models.TextChoices):
    COMIDA = 'COMIDA', 'Comida'
    BEBESTIBLE = 'BEBESTIBLE', 'Bebestible'
    BEBIDA_ALCOLICA = 'BEBIDA_ALCOLICA', 'Bebida Alcohólica'
    INGREDIENTE = 'INGREDIENTE', 'Ingrediente'
    INSUMO = 'INSUMO', 'Insumo'