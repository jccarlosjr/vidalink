from rest_framework.viewsets import ModelViewSet
from .models import Pagamento, Relatorio,  RegraPagamento
from .serializers import PagamentoSerializer, RelatorioSerializer, RegraPagamentoSerializer
from rest_framework.permissions import IsAuthenticated
from django.views.generic import TemplateView
from plantao.models import Plantao


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
        
        if self.request.query_params.get("data_inicio"):
            data_inicio = self.request.query_params.get("data_inicio")

            queryset = queryset.filter(
                plantao__inicio__date__gte=data_inicio
            )

        if self.request.query_params.get("data_fim"):
            data_fim = self.request.query_params.get("data_fim")

            queryset = queryset.filter(
                plantao__fim__date__lte=data_fim
            )

        return queryset.order_by('-id')

    def perform_create(self, serializer):
        pagamento = serializer.save()
        self._update_regra_plantao(pagamento)

    def perform_update(self, serializer):
        pagamento = serializer.save()
        self._update_regra_plantao(pagamento)

    def _update_regra_plantao(self, pagamento):
        Plantao.objects.filter(id=pagamento.plantao_id).update(
            regra_pagamento=self.request.data['regra_pagamento'],
            valor_calculado=self.request.data['valor_calculado'],
        )



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
