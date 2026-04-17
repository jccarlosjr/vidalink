from rest_framework import serializers
from .models import Plantao
from paciente.serializers import PacienteSerializer
from cuidadora.serializers import CuidadoraSerializer


class PlantaoSerializer(serializers.ModelSerializer):
    cuidadora_nome = serializers.CharField(source='cuidadora.nome', read_only=True)
    paciente_nome = serializers.CharField(source='paciente.nome', read_only=True)
    escala_codigo_interno = serializers.CharField(source='escala.codigo_interno', read_only=True)
    status_name = serializers.CharField(source='get_status_display', read_only=True)
    paciente = PacienteSerializer()
    cuidadora = CuidadoraSerializer()

    class Meta:
        model = Plantao
        fields = '__all__'
