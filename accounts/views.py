from rest_framework.viewsets import ModelViewSet
from .serializers import CustomUserSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.views import LoginView
from .models import CustomUser


class CustomUserViewSet(ModelViewSet):

    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    queryset = CustomUser.objects.all()


class CustomLoginView(LoginView):
    template_name = 'login.html'
