from django.contrib import admin
from .models import EventoPlantao

@admin.register(EventoPlantao)
class EventoPlantaoAdmin(admin.ModelAdmin):
    list_display = ('plantao__assistido__nome', 'plantao__profissional__nome', 'tipo', 'data_hora', 'created_at')
    search_fields = ('plantao__assistido__nome', 'plantao__profissional__nome', 'plantao__profissional__cpd', 'tipo', 'data_hora', 'created_at')
