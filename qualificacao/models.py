from django.db import models
from accounts.models import CustomUser


class Qualificacao(models.Model):
    instituicao = models.CharField(max_length=100)
    data = models.DateField()
    descricao = models.TextField()
    certificado = models.CharField(max_length=100)
    usuario = models.ForeignKey(CustomUser, on_delete=models.PROTECT)

    def __str__(self):
        return self.usuario

    class Meta:
        verbose_name = 'Qualificação'
        verbose_name_plural = 'Qualificações'
