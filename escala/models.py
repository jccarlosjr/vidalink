from django.db import models
from profissional.models import Profissional
from assistido.models import Assistido


class Escala(models.Model):
    codigo_interno = models.CharField(max_length=20, unique=True, null=True, blank=True)
    assistido = models.ForeignKey(Assistido, on_delete=models.PROTECT, related_name='assistido')
    profissional = models.ForeignKey(Profissional, on_delete=models.PROTECT, related_name='profissional')
    ativo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Escala'
        verbose_name_plural = 'Escalas'

    def __str__(self):
        return self.codigo_interno