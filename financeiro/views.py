from rest_framework.viewsets import ModelViewSet
from .models import Pagamento, Relatorio,  RegraPagamento
from .serializers import PagamentoSerializer, RelatorioSerializer, RegraPagamentoSerializer
from rest_framework.permissions import IsAuthenticated
from django.views.generic import TemplateView


class PagamentoViewSet(ModelViewSet):
    serializer_class = PagamentoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Pagamento.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        filter_type = self.request.query_params.get('filter_type', None)
        filter_value = self.request.query_params.get('filter_value', None)

        if filter_type and filter_value:
            queryset = queryset.filter(**{filter_type + "__icontains": filter_value})

        return queryset.order_by('-id')


class RelatorioViewSet(ModelViewSet):
    serializer_class = RelatorioSerializer
    permission_classes = [IsAuthenticated]
    queryset = Relatorio.objects.all()


class RegraPagamentoViewSet(ModelViewSet):
    serializer_class = RegraPagamentoSerializer
    permission_classes = [IsAuthenticated]
    queryset = RegraPagamento.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        filter_type = self.request.query_params.get('filter_type', None)
        filter_value = self.request.query_params.get('filter_value', None)
        ativa = self.request.query_params.get('ativa', None)

        if filter_type and filter_value:
            queryset = queryset.filter(**{filter_type + "__icontains": filter_value})
        if ativa is not None:
            if ativa == "true":
                queryset = queryset.filter(ativa=True)
            elif ativa == "false":
                queryset = queryset.filter(ativa=False)

        return queryset.order_by('-id')



class RegraPagamentoView(TemplateView):
    template_name = "regra_pagamento.html"


class PagamentoView(TemplateView):
    template_name = "pagamentos.html"


class RelatorioView(TemplateView):
    template_name = "relatorios.html"
