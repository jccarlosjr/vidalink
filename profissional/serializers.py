from rest_framework import serializers
from .models import Profissional

class ProfissionalSerializer(serializers.ModelSerializer):

    class Meta:        
        model = Profissional
        exclude = ['password', 'user_permissions', 'groups']
