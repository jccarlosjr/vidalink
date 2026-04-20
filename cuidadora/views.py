from rest_framework import viewsets
from .models import Cuidadora
from .serializers import CuidadoraSerializer
from django.views.generic import TemplateView
from rest_framework.decorators import action
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import status
from django.contrib.auth.views import LoginView
from rest_framework.response import Response



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
                queryset = queryset.filter(is_active=True)
            elif is_active == "false":
                queryset = queryset.filter(is_active=False)

        return queryset.order_by('-id')

    @action(detail=True, methods=['patch'], url_path='active')
    def active(self, request, pk):
        cuidadora = self.get_object()
        cuidadora.is_active = not cuidadora.is_active
        cuidadora.save()
        return self.retrieve(request)


    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        cuidadora = self.get_object()
        new_password = request.data.get('password')

        if not new_password:
            return Response(
                {"detail": "A senha é obrigatória."},
                status=status.HTTP_400_BAD_REQUEST
            )

        cuidadora.set_password(new_password)
        cuidadora.save()

        return Response(
            {"detail": "Senha redefinida com sucesso."},
            status=status.HTTP_200_OK
        )


class CuidadorasView(LoginRequiredMixin, TemplateView):
    template_name = 'cuidadoras.html'


class CustomLoginView(LoginView):
    template_name = 'login.html'
