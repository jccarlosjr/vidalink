from rest_framework import viewsets
from .models import Cuidadora
from .serializers import CuidadoraSerializer
from django.views.generic import TemplateView
from rest_framework.decorators import action
from django.contrib.auth.mixins import LoginRequiredMixin
from accounts.models import CustomUser


class CuidadoraViewSet(viewsets.ModelViewSet):
    queryset = Cuidadora.objects.all().order_by('-id')
    serializer_class = CuidadoraSerializer

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
        cuidadora = self.get_object()
        user = CustomUser.objects.filter(cuidadora=cuidadora).first()

        if user:
            user.is_active = not user.is_active
            user.save()

        cuidadora.ativo = not cuidadora.ativo
        cuidadora.save()
        return self.retrieve(request)


class CuidadorasView(LoginRequiredMixin, TemplateView):
    template_name = 'cuidadoras.html'