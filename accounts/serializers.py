from .models import CustomUser
from rest_framework import serializers
from cuidadora.serializers import CuidadoraSerializer


class CustomUserSerializer(serializers.ModelSerializer):

    cuidadora = CuidadoraSerializer(read_only=True)

    class Meta:
        model = CustomUser
        exclude = ['password', 'user_permissions', 'groups']
