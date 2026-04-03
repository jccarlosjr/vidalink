from django.db import models
from cuidadora.models import Cuidadora
from paciente.models import Paciente


class Escala(models.Model):
    codigo_interno = models.CharField(max_length=20, unique=True, null=True, blank=True)
    paciente = models.ForeignKey(Paciente, on_delete=models.PROTECT, related_name='paciente')
    cuidadora = models.ForeignKey(Cuidadora, on_delete=models.PROTECT, related_name='cuidadora')
    ativo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Escala'
        verbose_name_plural = 'Escalas'
