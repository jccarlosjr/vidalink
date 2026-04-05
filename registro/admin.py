from django.contrib import admin
from .models import EventoPlantao

@admin.register(EventoPlantao)
class EventoPlantaoAdmin(admin.ModelAdmin):
    list_display = ('plantao__paciente__nome', 'plantao__cuidadora__nome', 'tipo', 'data_hora', 'created_at')
    search_fields = ('plantao__paciente__nome', 'plantao__cuidadora__nome', 'plantao__cuidadora__cpd', 'tipo', 'data_hora', 'created_at')
