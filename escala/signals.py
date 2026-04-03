from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Escala


def get_internal_code(escala):
    escala_id = str(escala.id).zfill(5)
    data = timezone.now().strftime("%d%m%Y")
    return f"ESC-{data}-{escala_id}"


@receiver(post_save, sender=Escala)
def gerar_codigo_interno(sender, instance, created, **kwargs):
     if created:
        instance.codigo_interno = get_internal_code(instance)

        Escala.objects.filter(id=instance.id).update(
            codigo_interno=instance.codigo_interno
        )