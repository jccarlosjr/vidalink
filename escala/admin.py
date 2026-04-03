from django.contrib import admin
from .models import Escala

@admin.register(Escala)
class EscalaAdmin(admin.ModelAdmin):
    list_display = ('codigo_interno', 'paciente', 'cuidadora', 'ativo')
    search_fields = ('paciente__nome', 'cuidadora__nome', 'cuidadora__cpf', 'cuidadora__cnpj', 'codigo_interno', 'ativo')
