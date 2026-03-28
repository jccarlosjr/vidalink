from rest_framework.viewsets import ModelViewSet
from .serializers import PacienteSerializer, ResponsavelSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Paciente, Responsavel
from django.views.generic import TemplateView


class PacienteViewSet(ModelViewSet):

    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]
    queryset = Paciente.objects.all()


class ResponsavelViewSet(ModelViewSet):

    serializer_class = ResponsavelSerializer
    permission_classes = [IsAuthenticated]
    queryset = Responsavel.objects.all()


class PacientesListView(TemplateView):
    template_name = "pacientes.html"
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Paciente.objects.all()
        search = self.request.GET.get('search')
        if search:
            queryset = queryset.filter(nome__icontains=search)
        return queryset

