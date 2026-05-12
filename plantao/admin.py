from django.contrib import admin
from .models import Plantao, HistoricoPlantao

@admin.register(Plantao)
class PlantaoAdmin(admin.ModelAdmin):
    list_display = ('codigo_interno', 'data', 'inicio', 'fim', 'horas', 'status', 'profissional__nome', 'assistido__nome')
    search_fields = ('data', 'inicio', 'fim', 'horas', 'status', 'profissional__nome', 'assistido__nome', 'escala__codigo_interno')


@admin.register(HistoricoPlantao)
class HistoricoPlantaoAdmin(admin.ModelAdmin):
    list_display = ('plantao__codigo_interno', 'usuario__username', 'status', 'created_at', 'observacoes')
    search_fields = ('plantao__codigo_interno', 'usuario__username', 'status', 'created_at', 'observacoes')