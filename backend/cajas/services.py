from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Caja, MovimientoCaja
from cajas.enums import TipoMovimientoCaja
from auditoria.services import registrar_auditoria
from auditoria.enums import ModuloAuditoria, TipoEventoAuditoria

class CajaService:
    @staticmethod
    @transaction.atomic
    def abrir_caja(usuario, saldo_inicial):
        caja = Caja.objects.create(
            usuario_apertura=usuario,
            saldo_inicial=saldo_inicial,
            abierta=True,
            fecha_apertura=timezone.now()
        )
        
        registrar_auditoria(
            accion=TipoEventoAuditoria.ABRIR_CAJA,
            modulo=ModuloAuditoria.CAJAS,
            descripcion=f"Caja {caja.id} abierta por {usuario.username} con saldo inicial {saldo_inicial}",
            usuario=usuario
        )
        return caja

    @staticmethod
    @transaction.atomic
    def cerrar_caja(caja, usuario):
        if not caja.abierta:
            raise ValidationError("La caja ya está cerrada.")
        
        caja.abierta = False
        caja.usuario_cierre = usuario
        caja.fecha_cierre = timezone.now()
        caja.save(update_fields=['abierta', 'usuario_cierre', 'fecha_cierre'])

        caja_con_saldos = Caja.objects.con_saldos().get(id=caja.id)
        saldo_final = (caja_con_saldos.saldo_inicial + 
                (caja_con_saldos.total_ingresos or 0) - 
                (caja_con_saldos.total_egresos or 0))
        
        caja_con_saldos = Caja.objects.con_saldos().get(id=caja.id)
        saldo_final = (caja_con_saldos.saldo_inicial + 
                    (caja_con_saldos.total_ingresos or 0) - 
                    (caja_con_saldos.total_egresos or 0))
        
        registrar_auditoria(
            accion=TipoEventoAuditoria.CERRAR_CAJA,
            modulo=ModuloAuditoria.CAJAS,
            descripcion=f"Caja {caja.id} cerrada por {usuario.username}, Saldo final: ${saldo_final}",
            usuario=usuario
        )
        return caja
    
    @staticmethod
    def registrar_movimiento(caja, tipo, monto, descripcion, usuario):
        if not caja.abierta:
            raise ValidationError("No se pueden registrar movimientos en una caja cerrada.")
        
        if monto <= 0:
            raise ValidationError("El monto del movimiento debe ser mayor a cero.")

        movimiento = MovimientoCaja.objects.create(
            caja=caja,
            tipo=tipo,
            monto=monto,
            descripcion=descripcion
        )
        accion_auditoria = TipoEventoAuditoria.CREAR if tipo == TipoMovimientoCaja.INGRESO else TipoEventoAuditoria.ELIMINAR
        registrar_auditoria(
            accion=accion_auditoria,        
            modulo=ModuloAuditoria.CAJAS,
            descripcion=f"Movimiento de tipo {tipo} por monto {monto} en caja {caja.id} registrado por {usuario.username}",
            usuario=usuario
        )
        return movimiento
    
    @staticmethod
    def obtener_resumen_caja(caja):
        """Obtiene resumen financiero de una caja"""
        caja_con_saldos = Caja.objects.con_saldos().get(id=caja.id)
        return {
            'saldo_inicial': caja_con_saldos.saldo_inicial,
            'total_ingresos': caja_con_saldos.total_ingresos or 0,
            'total_egresos': caja_con_saldos.total_egresos or 0,
            'saldo_actual': (
                caja_con_saldos.saldo_inicial +
                (caja_con_saldos.total_ingresos or 0) - 
                (caja_con_saldos.total_egresos or 0)
            ),
            'estado': 'Abierta' if caja_con_saldos.abierta else 'Cerrada'
        }
