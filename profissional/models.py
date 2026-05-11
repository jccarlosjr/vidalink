from django.db import models
from django.contrib.auth.models import AbstractUser


class Profissional(AbstractUser):
    nome = models.CharField(max_length=100, null=True, blank=True)
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True)
    cnpj = models.CharField(max_length=18, null=True, blank=True)
    nascimento = models.DateField(null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    cep = models.CharField(max_length=9, null=True, blank=True)
    endereco = models.CharField(max_length=200, null=True, blank=True)
    numero = models.CharField(max_length=10, null=True, blank=True)
    complemento = models.CharField(max_length=100, null=True, blank=True)
    bairro = models.CharField(max_length=50, null=True, blank=True)
    cidade = models.CharField(max_length=50, null=True, blank=True)
    estado = models.CharField(max_length=2, null=True, blank=True)
    chave_pix = models.CharField(max_length=200, null=True, blank=True)
    tipo_chave_pix = models.CharField(max_length=20, null=True, blank=True)
    nome_banco = models.CharField(max_length=50, null=True, blank=True)
    codigo_banco = models.CharField(max_length=10, null=True, blank=True)
    tipo_conta = models.CharField(max_length=20, null=True, blank=True)
    numero_conta = models.CharField(max_length=20, null=True, blank=True)
    agencia_conta = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        verbose_name = 'Profissional'
        verbose_name_plural = 'Profissionais'

    def __str__(self):
        return self.username


class UserSession(models.Model):
    user = models.ForeignKey(Profissional, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=100)
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)