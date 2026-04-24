from rest_framework.serializers import ModelSerializer, SerializerMethodField, PrimaryKeyRelatedField
from .models import Pagamento, Relatorio, RegraPagamento
from plantao.models import Plantao


class RegraPagamentoSerializer(ModelSerializer):
    tipo_name = SerializerMethodField()

    def get_tipo_name(self, obj):
        return obj.get_tipo_display()

    class Meta:
        model = RegraPagamento
        fields = "__all__"


class PlantaoMinSerializer(ModelSerializer):
    regra_pagamento_detalhe = RegraPagamentoSerializer(source="regra_pagamento", read_only=True)

    class Meta:
        model = Plantao
        fields = '__all__'


class PagamentoSerializer(ModelSerializer):
    plantao_detalhe = PlantaoMinSerializer(source="plantao", read_only=True)
    status_name = SerializerMethodField()

    def get_status_name(self, obj):
        return obj.get_status_display()

    class Meta:
        model = Pagamento
        fields = "__all__"


class RelatorioSerializer(ModelSerializer):
    class Meta:
        model = Relatorio
        fields = "__all__"



