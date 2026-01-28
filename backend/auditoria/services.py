from .models import Auditoria

def registrar_auditoria(usuario, accion, modulo, descripcion):
    Auditoria.objects.create(
        usuario=usuario,
        accion=accion,
        modulo=modulo,
        descripcion=descripcion
    )