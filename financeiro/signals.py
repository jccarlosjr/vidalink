from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Relatorio, Pagamento


def get_internal_code(relatorio, tipo):
    relatorio_id = str(relatorio.id).zfill(5)
    data = timezone.now().strftime("%d%m%Y")
    return f"{tipo}-{data}-{relatorio_id}"


@receiver(post_save, sender=Relatorio)
def gerar_codigo_interno(sender, instance, created, **kwargs):
    if created:
        if not instance.codigo_interno:
            instance.codigo_interno = get_internal_code(instance, "REL")

            Relatorio.objects.filter(id=instance.id).update(
                codigo_interno=instance.codigo_interno
            )


@receiver(post_save, sender=Pagamento)
def gerar_codigo_interno(sender, instance, created, **kwargs):
    if created:
        if not instance.codigo_interno:
            instance.codigo_interno = get_internal_code(instance, "PGT")

            Pagamento.objects.filter(id=instance.id).update(
                codigo_interno=instance.codigo_interno
            )