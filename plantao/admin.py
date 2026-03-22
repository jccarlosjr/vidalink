from django.contrib import admin
from .models import Plantao

@admin.register(Plantao)
class PlantaoAdmin(admin.ModelAdmin):
    list_display = ('escala__codigo_interno', 'data', 'inicio', 'fim', 'horas', 'status', 'cuidador__username')
    search_fields = ('data', 'inicio', 'fim', 'horas', 'status', 'cuidador__username', 'escala__codigo_interno')
