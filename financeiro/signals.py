from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Relatorio, Pagamento
from rest_framework import serializers


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


@receiver(pre_save, sender=Pagamento)
def validar_pagamento(sender, instance, **kwargs):
    if instance.plantao.status != 'F':
        raise serializers.ValidationError({"erro": "Não é possível criar pagamento para plantão não finalizado"})


@receiver(pre_save, sender=Pagamento)
def has_pagamento(sender, instance, **kwargs):
    if instance.id:
        return
    if Pagamento.objects.filter(plantao=instance.plantao).exists():
        raise serializers.ValidationError({"erro": "Já existe um pagamento para o plantão selecionado"})


@receiver(post_save, sender=Relatorio)
def delete_relatorio_sem_pagamentos(sender, instance, created, **kwargs):
    if not instance.pagamentos.all().exists() and instance.status != "ABERTO":
        instance.delete()
