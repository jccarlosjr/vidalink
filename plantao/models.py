from django.db import models
from profissional.models import Profissional
from assistido.models import Assistido
from escala.models import Escala


STATUS_CHOICES = (
    ('P', 'Pendente'),
    ('A', 'Aguarda Atendimento'),
    ('C', 'Confirmado'),
    ('R', 'Em Andamento'),
    ('F', 'Finalizado'),
    ('E', 'Expirado'),
    ('D', 'Desistência do Profissional')
)


class Plantao(models.Model):
    codigo_interno = models.CharField(max_length=20, null=True, blank=True)
    data = models.DateField()
    inicio = models.DateTimeField()
    fim = models.DateTimeField()
    horas = models.IntegerField()
    horas_cumpridas = models.FloatField(default=0)
    valor_calculado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='A')
    profissional = models.ForeignKey(Profissional, on_delete=models.PROTECT)
    escala = models.ForeignKey(Escala, on_delete=models.PROTECT)
    assistido = models.ForeignKey(Assistido, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    observacoes = models.TextField(null=True, blank=True)
    regra_pagamento = models.ForeignKey("financeiro.RegraPagamento", on_delete=models.PROTECT, null=True, blank=True)

    def __str__(self):
        return self.codigo_interno

    @property
    def horas_cumpridas_formatadas(self):
        horas = int(self.horas_cumpridas)
        minutos = int(round((self.horas_cumpridas - horas) * 60))

        if minutos == 60:
            horas += 1
            minutos = 0

        return f"{horas:02d}:{minutos:02d}"

    class Meta:
        verbose_name = 'Plantão'
        verbose_name_plural = 'Plantões'
