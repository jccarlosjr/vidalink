from rest_framework.viewsets import ModelViewSet
from .serializers import PacienteSerializer, ResponsavelSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Paciente, Responsavel
from django.views.generic import TemplateView
from rest_framework.filters import SearchFilter


class PacienteViewSet(ModelViewSet):
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]
    queryset = Paciente.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        filter_type = self.request.query_params.get('filter_type', None)
        filter_value = self.request.query_params.get('filter_value', None)
        if filter_type and filter_value:
            queryset = queryset.filter(**{filter_type + "__icontains": filter_value})
        return queryset


class ResponsavelViewSet(ModelViewSet):

    serializer_class = ResponsavelSerializer
    permission_classes = [IsAuthenticated]
    queryset = Responsavel.objects.all()

    def get_queryset(self):
        queryset = Responsavel.objects.all()
        paciente = self.request.GET.get('paciente')
        if paciente:
            queryset = queryset.filter(paciente=paciente)
        return queryset


class PacientesListView(TemplateView):
    template_name = "pacientes.html"


