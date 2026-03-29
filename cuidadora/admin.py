from django.contrib import admin
from .models import Cuidadora

@admin.register(Cuidadora)
class CuidadoraAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cpf', 'cnpj', 'nascimento', 'telefone', 'endereco', 'cidade', 'estado', 'ativo')
    search_fields = ('nome', 'cpf', 'cnpj', 'nascimento', 'telefone', 'endereco', 'cidade', 'estado', 'ativo')
