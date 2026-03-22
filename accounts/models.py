from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    cpf = models.CharField(max_length=14, null=True, blank=True, unique=True)
    cnpj = models.CharField(max_length=18, null=True, blank=True)
    nascimento = models.DateField(null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    endereco = models.CharField(max_length=150, null=True, blank=True)
    cep = models.CharField(max_length=9, null=True, blank=True)
    endereco = models.CharField(max_length=200, null=True, blank=True)
    cidade = models.CharField(max_length=50, null=True, blank=True)
    estado = models.CharField(max_length=2, null=True, blank=True)

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'


class UserSession(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=100)
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)
