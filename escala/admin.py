from django.contrib import admin
from .models import Escala

@admin.register(Escala)
class EscalaAdmin(admin.ModelAdmin):
    list_display = ('paciente', 'cuidador', 'ativo')
    search_fields = ('paciente', 'cuidador', 'ativo')
