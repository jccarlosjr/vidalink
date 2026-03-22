from django.db import models


class Responsavel(models.Model):
    nome = models.CharField(max_length=100)
    telefone = models.CharField(max_length=20)

    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = 'Responsável'
        verbose_name_plural = 'Responsáveis'


class Paciente(models.Model):
    nome = models.CharField(max_length=100)
    idade = models.PositiveIntegerField()
    sexo = models.CharField(max_length=1, choices=[('M', 'Masculino'), ('F', 'Feminino')])
    cep = models.CharField(max_length=9)
    endereco = models.CharField(max_length=200)
    cidade = models.CharField(max_length=50)
    estado = models.CharField(max_length=2)
    responsavel = models.ForeignKey(Responsavel, on_delete=models.PROTECT)
    observacoes = models.TextField()

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'
