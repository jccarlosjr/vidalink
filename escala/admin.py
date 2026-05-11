from django.contrib import admin
from .models import Escala

@admin.register(Escala)
class EscalaAdmin(admin.ModelAdmin):
    list_display = ('codigo_interno', 'assistido', 'profissional', 'ativo')
    search_fields = ('assistido__nome', 'profissional__nome', 'profissional__cpf', 'profissional__cnpj', 'codigo_interno', 'ativo')
