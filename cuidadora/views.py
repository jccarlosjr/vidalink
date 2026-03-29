from rest_framework import viewsets
from .models import Cuidadora
from .serializers import CuidadoraSerializer
from django.views.generic import TemplateView


class CuidadoraViewSet(viewsets.ModelViewSet):
    queryset = Cuidadora.objects.all()
    serializer_class = CuidadoraSerializer


class CuidadorasView(TemplateView):
    template_name = 'cuidadoras.html'