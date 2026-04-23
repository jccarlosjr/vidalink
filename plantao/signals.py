from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.db import transaction
from plantao.models import Plantao
from financeiro.models import Pagamento
from plantao.services import PlantaoValidator
from django.utils import timezone


def get_internal_code(relatorio, tipo):
    relatorio_id = str(relatorio.id).zfill(5)
    data = timezone.now().strftime("%d%m%Y")
    return f"{tipo}-{data}-{relatorio_id}"


@receiver(pre_save, sender=Plantao)
def cache_status_anterior(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._status_anterior = (
                Plantao.objects
                .only("status")
                .get(pk=instance.pk)
                .status
            )
        except Plantao.DoesNotExist:
            instance._status_anterior = None
    else:
        instance._status_anterior = None


@receiver(post_save, sender=Plantao)
def criar_pagamento_se_finalizado(sender, instance, **kwargs):
    status_anterior = getattr(instance, "_status_anterior", None)

    if instance.status == 'F' and status_anterior != 'F':

        if instance.pagamentos.exists():
            return

        with transaction.atomic():
            valor = PlantaoValidator.calcular_valor_plantao(instance)

            Pagamento.objects.create(
                plantao=instance,
                valor_calculado=valor
            )
