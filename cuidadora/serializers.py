from rest_framework import serializers
from .models import Cuidadora

class CuidadoraSerializer(serializers.ModelSerializer):

    class Meta:        
        model = Cuidadora
        exclude = ['password', 'user_permissions', 'groups']
