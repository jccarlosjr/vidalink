from django.db import models
from cuidadora.models import Cuidadora
from paciente.models import Paciente
from escala.models import Escala

STATUS_CHOICES = (
    ('P', 'Pendente de Cuidador'),
    ('A', 'Cuidador Aprovado'),
    ('C', 'Confirmado'),
    ('F', 'Finalizado')
)


class Plantao(models.Model):
    data = models.DateField()
    inicio = models.DateTimeField()
    fim = models.DateTimeField()
    horas = models.IntegerField()
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P')
    cuidadora = models.ForeignKey(Cuidadora, on_delete=models.PROTECT)
    escala = models.ForeignKey(Escala, on_delete=models.PROTECT)
    paciente = models.ForeignKey(Paciente, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    observacoes = models.TextField(null=True, blank=True) 

    def __str__(self):
        return self.escala.codigo_interno

    class Meta:
        verbose_name = 'Plantão'
        verbose_name_plural = 'Plantões'
