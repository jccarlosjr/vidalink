from rest_framework import viewsets
from .models import Cuidadora
from .serializers import CuidadoraSerializer
from .filters import CuidadoraFilter
from django.views.generic import TemplateView
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.mixins import LoginRequiredMixin


class CuidadoraViewSet(viewsets.ModelViewSet):
    queryset = Cuidadora.objects.all()
    serializer_class = CuidadoraSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CuidadoraFilter

    @action(detail=True, methods=['patch'])
    def active(self, request, pk):
        cuidadora = self.get_object()
        cuidadora.ativo = not cuidadora.ativo
        cuidadora.save()
        return self.retrieve(request)


class CuidadorasView(LoginRequiredMixin, TemplateView):
    template_name = 'cuidadoras.html'