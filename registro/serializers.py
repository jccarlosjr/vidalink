from .models import EventoPlantao
from rest_framework import serializers


class EventoPlantaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventoPlantao
        fields = ['id', 'plantao', 'tipo', 'data_hora', 'latitude', 'longitude', 'precisao', 'dispositivo', 'created_at']
