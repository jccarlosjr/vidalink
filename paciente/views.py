from rest_framework.viewsets import ModelViewSet
from .serializers import PacienteSerializer, ResponsavelSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Paciente, Responsavel


class PacienteViewSet(ModelViewSet):

    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]
    queryset = Paciente.objects.all()


class ResponsavelViewSet(ModelViewSet):

    serializer_class = ResponsavelSerializer
    permission_classes = [IsAuthenticated]
    queryset = Responsavel.objects.all()
