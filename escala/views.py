from rest_framework.viewsets import ModelViewSet
from .serializers import EscalaSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Escala


class EscalaViewSet(ModelViewSet):

    serializer_class = EscalaSerializer
    permission_classes = [IsAuthenticated]
    queryset = Escala.objects.all()
