from django.db import models
from core.models import ModeloBase, Usuario
from .enums import TipoEventoAuditoria, ModuloAuditoria

class Auditoria(ModeloBase):
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='auditorias'
    )
    accion = models.CharField(
        max_length=20,
        choices=TipoEventoAuditoria.choices
    )
    modulo = models.CharField(
        max_length=20,
        choices=ModuloAuditoria.choices
    )
    descripcion = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['accion']),
            models.Index(fields=['modulo']),
            models.Index(fields=['fecha_creacion']),
        ]
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"{self.usuario} - {self.accion} - {self.modulo}"
