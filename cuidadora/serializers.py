from rest_framework import serializers
from .models import Cuidadora

class CuidadoraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuidadora
        fields = '__all__'
