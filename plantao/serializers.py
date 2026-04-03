from rest_framework import serializers
from .models import Plantao


class PlantaoSerializer(serializers.ModelSerializer):
    cuidadora_nome = serializers.CharField(source='cuidadora.nome', read_only=True)

    class Meta:
        model = Plantao
        fields = '__all__'
