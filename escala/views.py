from rest_framework.viewsets import ModelViewSet
from .serializers import EscalaSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Escala
from django.views.generic import TemplateView


class EscalaViewSet(ModelViewSet):

    serializer_class = EscalaSerializer
    permission_classes = [IsAuthenticated]
    queryset = Escala.objects.all()


class EscalaView(TemplateView):
    template_name = 'escalas.html'