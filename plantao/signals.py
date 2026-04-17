from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Plantao


def get_internal_code(plantao):
    plantao_id = str(plantao.id).zfill(5)
    data = timezone.now().strftime("%d%m%Y")
    return f"PLA-{data}-{plantao_id}"


@receiver(post_save, sender=Plantao)
def gerar_codigo_interno(sender, instance, created, **kwargs):
    print("SIGNAL DISPARADO", created)

    if created:
        instance.codigo_interno = get_internal_code(instance)

        Plantao.objects.filter(id=instance.id).update(
            codigo_interno=instance.codigo_interno
        )
            