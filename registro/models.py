from django.db import models
from plantao.models import Plantao

TIPO_CHOICES = (
    ('I', 'Início'),
    ('F', 'Fim'),
)

class EventoPlantao(models.Model):
    plantao = models.ForeignKey(Plantao, on_delete=models.PROTECT, related_name='eventos')
    tipo = models.CharField(max_length=1, choices=TIPO_CHOICES)
    data_hora = models.DateTimeField(auto_now_add=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    precisao = models.FloatField(null=True, blank=True)
    dispositivo = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    endereco = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.plantao.assistido} - {self.plantao.profissional}"

    class Meta:
        ordering = ['data_hora']
        verbose_name = 'Registro de Plantões'
        verbose_name_plural = 'Registro de Plantões'