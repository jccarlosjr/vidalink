from rest_framework.viewsets import ModelViewSet
from .serializers import CustomUserSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.views import LoginView
from django.views.generic import TemplateView
from .models import CustomUser
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response
from cuidadora.models import Cuidadora


class CustomUserViewSet(ModelViewSet):
    
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    queryset = CustomUser.objects.all()


    def get_queryset(self):
        queryset = super().get_queryset()
        filter_type = self.request.query_params.get('filter_type', None)
        filter_value = self.request.query_params.get('filter_value', None)
        if filter_type and filter_value:
            queryset = queryset.filter(**{filter_type + "__icontains": filter_value})
        return queryset.order_by('-id')


    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('password')

        if not new_password:
            return Response(
                {"detail": "Password é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"detail": "Senha redefinida com sucesso."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['patch'], url_path='active')
    def active(self, request, pk):
        user = self.get_object()
        cuidadora = Cuidadora.objects.filter(id=user.cuidadora.id).first()

        if cuidadora:
            cuidadora.ativo = not cuidadora.ativo
            cuidadora.save()

        user.is_active = not user.is_active
        user.save()
        return self.retrieve(request)


class CustomLoginView(LoginView):
    template_name = 'login.html'


class UserAdminView(TemplateView):
    template_name = 'usuarios.html'
