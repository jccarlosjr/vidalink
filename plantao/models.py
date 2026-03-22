from django.db import models
from accounts.models import CustomUser
from paciente.models import Paciente

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
    status = models.CharField(max_length=1, choices=STATUS_CHOICES)
    cuidador = models.ForeignKey(CustomUser, on_delete=models.PROTECT)
    paciente = models.ForeignKey(Paciente, on_delete=models.PROTECT)

    def __str__(self):
        return self.paciente

    class Meta:
        verbose_name = 'Plantão'
        verbose_name_plural = 'Plantões'
