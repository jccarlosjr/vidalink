from rest_framework.viewsets import ModelViewSet
from .serializers import PacienteSerializer, ResponsavelSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Paciente, Responsavel
from django.views.generic import TemplateView
from app.mixins import StaffRequiredMixin
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework.decorators import action


class PacienteViewSet(ModelViewSet):
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]
    queryset = Paciente.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        filter_type = self.request.query_params.get('filter_type', None)
        filter_value = self.request.query_params.get('filter_value', None)
        is_active = self.request.query_params.get('is_active', None)

        if filter_type and filter_value:
            queryset = queryset.filter(**{filter_type + "__icontains": filter_value})
        if is_active is not None:
            if is_active == "true":
                queryset = queryset.filter(ativo=True)
            elif is_active == "false":
                queryset = queryset.filter(ativo=False)

        return queryset.order_by('-id')


    @action(detail=True, methods=['patch'], url_path='active')
    def active(self, request, pk):
        paciente = self.get_object()
        paciente.ativo = not paciente.ativo
        paciente.save()
        return self.retrieve(request)


class ResponsavelViewSet(ModelViewSet):

    serializer_class = ResponsavelSerializer
    permission_classes = [IsAuthenticated]
    queryset = Responsavel.objects.all()

    def get_queryset(self):
        queryset = Responsavel.objects.all()
        paciente = self.request.GET.get('paciente')
        if paciente:
            queryset = queryset.filter(paciente=paciente)
        return queryset.order_by('-id')


class PacientesListView(StaffRequiredMixin, LoginRequiredMixin, TemplateView):
    template_name = "pacientes.html"


