from rest_framework import serializers
from .models import Qualificacao

class QualificacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Qualificacao
        fields = '__all__'
