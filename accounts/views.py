from rest_framework.viewsets import ModelViewSet
from .serializers import CustomUserSerializer
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser


class CustomUserViewSet(ModelViewSet):

    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    queryset = CustomUser.objects.all()
