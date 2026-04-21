from django.db import models
from cuidadora.models import Cuidadora
from paciente.models import Paciente
from escala.models import Escala


STATUS_CHOICES = (
    ('P', 'Pendente'),
    ('A', 'Aguarda Atendimento'),
    ('C', 'Confirmado'),
    ('R', 'Em Andamento'),
    ('F', 'Finalizado'),
    ('E', 'Expirado'),
    ('D', 'Desistência do Cuidador')
)


class Plantao(models.Model):
    data = models.DateField()
    inicio = models.DateTimeField()
    fim = models.DateTimeField()
    horas = models.IntegerField()
    horas_cumpridas = models.FloatField(default=0)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='A')
    cuidadora = models.ForeignKey(Cuidadora, on_delete=models.PROTECT)
    escala = models.ForeignKey(Escala, on_delete=models.PROTECT)
    paciente = models.ForeignKey(Paciente, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    observacoes = models.TextField(null=True, blank=True) 

    def __str__(self):
        return self.escala.codigo_interno

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
