from rest_framework import serializers
from .models import Assistido, Responsavel


class ResponsavelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Responsavel
        fields = '__all__'


class AssistidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assistido
        fields = '__all__'
