from rest_framework.viewsets import ModelViewSet
from .serializers import QualificacaoSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Qualificacao


class QualificacaoViewSet(ModelViewSet):

    serializer_class = QualificacaoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Qualificacao.objects.all()
