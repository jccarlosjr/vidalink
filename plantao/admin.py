from django.contrib import admin
from .models import Plantao

@admin.register(Plantao)
class PlantaoAdmin(admin.ModelAdmin):
    list_display = ('codigo_interno', 'data', 'inicio', 'fim', 'horas', 'status', 'cuidadora__nome', 'paciente__nome')
    search_fields = ('data', 'inicio', 'fim', 'horas', 'status', 'cuidadora__nome', 'paciente__nome', 'escala__codigo_interno')
