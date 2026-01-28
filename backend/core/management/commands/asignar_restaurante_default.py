"""
Comando de Django para asignar un restaurante por defecto a datos existentes
Uso: python manage.py asignar_restaurante_default
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from restaurantes.models import Restaurante
from mesas.models import Sala
from inventario.models import Ingrediente
from productos.models import Categoria, Producto
from cajas.models import Caja


class Command(BaseCommand):
    help = 'Asigna un restaurante por defecto a todos los registros que no tengan uno'

    def add_arguments(self, parser):
        parser.add_argument(
            '--restaurante-id',
            type=str,
            help='ID del restaurante a asignar (opcional, se creará uno si no existe)'
        )

    @transaction.atomic
    def handle(self, *args, **options):
        restaurante_id = options.get('restaurante_id')
        
        # Obtener o crear restaurante
        if restaurante_id:
            try:
                restaurante = Restaurante.objects.get(id=restaurante_id)
                self.stdout.write(f"Usando restaurante existente: {restaurante.nombre}")
            except Restaurante.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"No existe restaurante con ID {restaurante_id}"))
                return
        else:
            # Crear restaurante por defecto si no existe
            restaurante, created = Restaurante.objects.get_or_create(
                rut='99999999-9',
                defaults={
                    'nombre': 'Restaurante Demo',
                    'razon_social': 'Demo Restaurant SPA',
                    'direccion': 'Dirección de ejemplo',
                    'activo': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"✓ Restaurante creado: {restaurante.nombre}"))
            else:
                self.stdout.write(f"Usando restaurante existente: {restaurante.nombre}")

        # Asignar a Salas
        salas_actualizadas = Sala.objects.filter(restaurante__isnull=True).update(restaurante=restaurante)
        self.stdout.write(self.style.SUCCESS(f"✓ {salas_actualizadas} salas actualizadas"))

        # Asignar a Ingredientes
        ingredientes_actualizados = Ingrediente.objects.filter(restaurante__isnull=True).update(restaurante=restaurante)
        self.stdout.write(self.style.SUCCESS(f"✓ {ingredientes_actualizados} ingredientes actualizados"))

        # Asignar a Categorías
        categorias_actualizadas = Categoria.objects.filter(restaurante__isnull=True).update(restaurante=restaurante)
        self.stdout.write(self.style.SUCCESS(f"✓ {categorias_actualizadas} categorías actualizadas"))

        # Asignar a Productos
        productos_actualizados = Producto.objects.filter(restaurante__isnull=True).update(restaurante=restaurante)
        self.stdout.write(self.style.SUCCESS(f"✓ {productos_actualizados} productos actualizados"))

        # Asignar a Cajas
        cajas_actualizadas = Caja.objects.filter(restaurante__isnull=True).update(restaurante=restaurante)
        self.stdout.write(self.style.SUCCESS(f"✓ {cajas_actualizadas} cajas actualizadas"))

        self.stdout.write(self.style.SUCCESS('\n✅ Proceso completado exitosamente'))
        self.stdout.write(f"Restaurante asignado: {restaurante.nombre} (ID: {restaurante.id})")
