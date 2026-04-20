from rest_framework import serializers
from .models import Plantao
from paciente.models import Paciente
from cuidadora.serializers import CuidadoraSerializer
from cuidadora.models import Cuidadora
from paciente.serializers import PacienteSerializer


class PlantaoSerializer(serializers.ModelSerializer):
    cuidadora_nome = serializers.CharField(source='cuidadora.nome', read_only=True)
    paciente_nome = serializers.CharField(source='paciente.nome', read_only=True)
    escala_codigo_interno = serializers.CharField(source='escala.codigo_interno', read_only=True)
    status_name = serializers.CharField(source='get_status_display', read_only=True)

    cuidadora = serializers.PrimaryKeyRelatedField(queryset=Cuidadora.objects.all())
    paciente = serializers.PrimaryKeyRelatedField(queryset=Paciente.objects.all())

    cuidadora_detalhe = CuidadoraSerializer(source='cuidadora', read_only=True)
    paciente_detalhe = PacienteSerializer(source='paciente', read_only=True)

    class Meta:
        model = Plantao
        fields = '__all__'