from django.db import models

class TipoEventoAuditoria(models.TextChoices):
    LOGIN = 'LOGIN', 'Inicio de Sesión'
    LOGOUT = 'LOGOUT', 'Cierre de Sesión'
    CREAR = 'CREAR', 'Crear'
    MODIFICAR = 'MODIFICAR', 'Modificar'
    ELIMINAR = 'ELIMINAR', 'Eliminar'
    CERRAR_VENTA = 'CERRAR_VENTA', 'Cerrar Venta'
    ABRIR_CAJA = 'ABRIR_CAJA', 'Abrir Caja'
    CERRAR_CAJA = 'CERRAR_CAJA', 'Cerrar Caja'
    APERTURAR_MESA = 'APERTURAR_MESA', 'Aperturar Mesa'
    CERRAR_MESA = 'CERRAR_MESA', 'Cerrar Mesa'

class ModuloAuditoria(models.TextChoices):
    VENTAS = 'VENTAS', 'Ventas'
    INVENTARIO = 'INVENTARIO', 'Inventario'
    CAJAS = 'CAJAS', 'Cajas'
    PEDIDOS = 'PEDIDOS', 'Pedidos'
    PRODUCTOS = 'PRODUCTOS', 'Productos'
    USUARIOS = 'USUARIOS', 'Usuarios'
    SISTEMA = 'SISTEMA', 'Sistema'