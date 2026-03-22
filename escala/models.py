from django.db import models
from accounts.models import CustomUser
from paciente.models import Paciente
from datetime import datetime


def get_internal_code(escala):
    id = str(escala.id).zfill(5)
    codigo_interno = datetime.now().strftime(f"ESC-%y%m%d{id}")
    return codigo_interno


class Escala(models.Model):
    codigo_interno = models.CharField(max_length=20, unique=True, null=True, blank=True)
    paciente = models.ForeignKey(Paciente, on_delete=models.PROTECT, related_name='paciente')
    cuidador = models.ForeignKey(CustomUser, on_delete=models.PROTECT, related_name='cuidador')
    ativo = models.BooleanField(default=True)

    def __str__(self):
        return self.codigo_interno

    def save(self, *args, **kwargs):
        if not self.id:
            super().save(*args, **kwargs)

        if not self.codigo_interno:
            self.codigo_interno = get_internal_code(self)
            kwargs['force_insert'] = False
            super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = 'Escala'
        verbose_name_plural = 'Escalas'
