from django.db import models
from cuidadora.models import Cuidadora
from paciente.models import Paciente
from django.utils import timezone


class RegraPagamento(models.Model):
    class Tipo(models.TextChoices):
        HORA = "HORA", "Por Hora"
        PLANTAO = "PLANTAO", "Por Plantão"

    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=10, choices=Tipo.choices, default=Tipo.PLANTAO)
    valor_base = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ativa = models.BooleanField(default=True)
    data_inicio = models.DateField(auto_now_add=True)
    data_fim = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.nome


class Relatorio(models.Model):
    class Status(models.TextChoices):
        ABERTO = "ABERTO", "Aberto"
        FECHADO = "FECHADO", "Fechado"
        PAGO = "PAGO", "Pago"

    cuidadora = models.ForeignKey(Cuidadora, on_delete=models.PROTECT, related_name="relatorios")
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.ABERTO)
    data_referencia = models.DateField(null=True, blank=True)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deducoes = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valor_liquido = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    fechado_em = models.DateTimeField(null=True, blank=True)
    observacoes = models.TextField(blank=True)
    codigo_interno = models.CharField(max_length=20, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.codigo_interno


class Pagamento(models.Model):
    class StatusPagamento(models.TextChoices):
        PENDENTE = "PENDENTE", "Pendente"
        PAGO = "PAGO", "Pago"
        CANCELADO = "CANCELADO", "Cancelado"
        ADICIONADO_RELATORIO = "ADICIONADO_RELATORIO", "Adicionado ao Relatório"


    relatorio = models.ForeignKey(Relatorio, on_delete=models.PROTECT, related_name="pagamentos", null=True, blank=True)
    plantao = models.ForeignKey("plantao.Plantao", on_delete=models.PROTECT, related_name="pagamentos", null=True, blank=True)
    valor_calculado = models.DecimalField(max_digits=10, decimal_places=2)
    valor_pago = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    data_pagamento = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=StatusPagamento.choices, default=StatusPagamento.PENDENTE)
    codigo_interno = models.CharField(max_length=20, unique=True, null=True, blank=True)

    def __str__(self):
        return f"Pagamento #{self.id}"
