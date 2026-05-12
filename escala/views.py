from rest_framework.viewsets import ModelViewSet
from .serializers import EscalaSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Escala
from django.views.generic import TemplateView
from app.mixins import StaffRequiredMixin, IsStaffPermission
from django.contrib.auth.mixins import LoginRequiredMixin


class EscalaViewSet(ModelViewSet):

    serializer_class = EscalaSerializer
    permission_classes = [IsAuthenticated, IsStaffPermission]
    queryset = Escala.objects.all()


class EscalaView(StaffRequiredMixin, LoginRequiredMixin, TemplateView):
    template_name = 'escalas.html'