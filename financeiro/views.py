from rest_framework.viewsets import ModelViewSet
from .models import Pagamento, Relatorio,  RegraPagamento
from .serializers import PagamentoSerializer, RelatorioSerializer, RegraPagamentoSerializer
from rest_framework.permissions import IsAuthenticated
from app.mixins import StaffRequiredMixin, IsStaffPermission
from django.views.generic import TemplateView
from plantao.models import Plantao
from rest_framework import serializers
from django.db.models import Count
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.mixins import LoginRequiredMixin



class PagamentoViewSet(ModelViewSet):
    serializer_class = PagamentoSerializer
    permission_classes = [IsAuthenticated, IsStaffPermission]
    queryset = Pagamento.objects.all()


    def get_queryset(self):
        queryset = super().get_queryset()
        filter_type = self.request.query_params.get('filter_type', None)
        filter_value = self.request.query_params.get('filter_value', None)
        profissional = self.request.query_params.get('profissional', None)
        status = self.request.query_params.get('status', None)

        if profissional:
            queryset = queryset.filter(
                plantao__profissional_id=profissional
            )

        if status:
            queryset = queryset.filter(status=status)

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
        pagamento_data = serializer.validated_data
        self._validate_pagamento_data(pagamento_data)

        pagamento = serializer.save()
        self._update_regra_plantao(pagamento)


    def perform_update(self, serializer):
        pagamento = self.get_object()
        self._validate_pagamento(pagamento)
        pagamento = serializer.save()
        self._update_regra_plantao(pagamento)


    def perform_destroy(self, instance):
        self._validate_pagamento(instance)
        super().perform_destroy(instance)


    @action(detail=True, methods=['patch'], url_path='update_status')
    def update_status(self, request, pk=None):
        pagamento = self.get_object()
        pagamento = PagamentoSerializer(pagamento, data=request.data, partial=True)
        pagamento.is_valid(raise_exception=True)
        pagamento.save()
        return Response(pagamento.data)


    def _validate_pagamento(self, pagamento):
        if pagamento.status in ["PAGO", "ADICIONADO_RELATORIO"]:
            raise serializers.ValidationError({"erro": "O pagamento já foi processado ou adicionado a um relatório. Não é possível editar ou deletar."})
        if pagamento.relatorio is not None:
            raise serializers.ValidationError({"erro": "O pagamento já foi adicionado a um relatório."})
        if pagamento.plantao.status not in ["F", "E"]:
            raise serializers.ValidationError({"erro": "Plantão não foi finalizado"})


    def _validate_pagamento_data(self, data):
        plantao = data.get("plantao")
        if plantao.status not in ["F", "E"]:
            raise serializers.ValidationError({
                "erro": "Plantão não foi finalizado"
            })


    def _update_regra_plantao(self, pagamento):
        regra_pagamento = self.request.data.get('regra_pagamento')
        if regra_pagamento is not None:
            Plantao.objects.filter(id=pagamento.plantao_id).update(
                regra_pagamento=regra_pagamento,
            )
        valor_calculado = self.request.data.get('valor_calculado')
        if valor_calculado is not None:
            Plantao.objects.filter(id=pagamento.plantao_id).update(
                valor_calculado=valor_calculado,
            )


class RelatorioViewSet(ModelViewSet):
    serializer_class = RelatorioSerializer
    permission_classes = [IsAuthenticated, IsStaffPermission]
    queryset = Relatorio.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        filter_type = self.request.query_params.get('filter_type', None)
        filter_value = self.request.query_params.get('filter_value', None)

        if filter_type and filter_value:
            queryset = queryset.filter(**{filter_type + "__icontains": filter_value})
        return queryset.annotate(pagamentos_count=Count('pagamentos')).order_by('-id')
    

    def perform_create(self, serializer):
        relatorio = serializer.save()
        pagamentos = self.request.data.get('pagamentos', [])
        self._update_pagamentos(pagamentos, relatorio)


    def perform_update(self, serializer):
        relatorio = serializer.save()
        pagamentos = self.request.data.get('pagamentos', [])
        if relatorio.status == "PAGO":
            self._update_pagamentos(pagamentos, relatorio, status="PAGO")
        else:
            self._update_pagamentos(pagamentos, relatorio)


    def _update_pagamentos(self, pagamentos, relatorio, status="ADICIONADO_RELATORIO", *args, **kwargs):
        for pagamento in pagamentos:
            pagamento = Pagamento.objects.get(id=pagamento)
            pagamento.relatorio = relatorio
            pagamento.status = status
            pagamento.save()


class RegraPagamentoViewSet(ModelViewSet):
    serializer_class = RegraPagamentoSerializer
    permission_classes = [IsAuthenticated, IsStaffPermission]
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



class RegraPagamentoView(StaffRequiredMixin, LoginRequiredMixin, TemplateView):
    template_name = "regra_pagamento.html"


class PagamentoView(StaffRequiredMixin, LoginRequiredMixin, TemplateView):
    template_name = "pagamentos.html"


class RelatorioView(StaffRequiredMixin, LoginRequiredMixin, TemplateView):
    template_name = "relatorios.html"
