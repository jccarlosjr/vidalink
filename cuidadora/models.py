from django.db import models


class Cuidadora(models.Model):
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=14, unique=True)
    cnpj = models.CharField(max_length=18, unique=True)
    nascimento = models.DateField()
    telefone = models.CharField(max_length=20)
    cep = models.CharField(max_length=9, blank=True, null=True)
    endereco = models.CharField(max_length=200, blank=True, null=True)
    numero = models.CharField(max_length=10, blank=True, null=True)
    complemento = models.CharField(max_length=100, blank=True, null=True)
    bairro = models.CharField(max_length=50, blank=True, null=True)
    cidade = models.CharField(max_length=50, blank=True, null=True)
    estado = models.CharField(max_length=2, blank=True, null=True)
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cuidadora'
        verbose_name_plural = 'Cuidadoras'

    def __str__(self):
        return self.nome
