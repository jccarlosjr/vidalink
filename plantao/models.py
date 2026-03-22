from django.db import models
from accounts.models import CustomUser
from paciente.models import Paciente
from escala.models import Escala

STATUS_CHOICES = (
    ('P', 'Pendente de Cuidador'),
    ('A', 'Cuidador Aprovado'),
    ('F', 'Finalizado')
)


class Plantao(models.Model):
    data = models.DateField()
    inicio = models.DateTimeField()
    fim = models.DateTimeField()
    horas = models.IntegerField()
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P')
    cuidador = models.ForeignKey(CustomUser, on_delete=models.PROTECT)
    escala = models.ForeignKey(Escala, on_delete=models.PROTECT)

    def __str__(self):
        return self.escala.codigo_interno

    class Meta:
        verbose_name = 'Plantão'
        verbose_name_plural = 'Plantões'
