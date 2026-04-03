from django.db import models
from django.contrib.auth.models import AbstractUser
from cuidadora.models import Cuidadora


class CustomUser(AbstractUser):
    cuidadora = models.ForeignKey(Cuidadora, on_delete=models.CASCADE, null=True, blank=True)

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
