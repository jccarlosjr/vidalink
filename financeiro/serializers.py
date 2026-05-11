from rest_framework.serializers import ModelSerializer, SerializerMethodField, PrimaryKeyRelatedField
from .models import Pagamento, Relatorio, RegraPagamento
from plantao.models import Plantao
from profissional.models import Profissional
from rest_framework import serializers
from assistido.models import Assistido


class RegraPagamentoSerializer(ModelSerializer):
    tipo_name = SerializerMethodField()

    def get_tipo_name(self, obj):
        return obj.get_tipo_display()

    class Meta:
        model = RegraPagamento
        fields = "__all__"


class AssistidoMinSerializer(ModelSerializer):
    class Meta:
        model = Assistido
        fields = ['id', 'nome']


class ProfissionalMinSerializer(ModelSerializer):
    class Meta:
        model = Profissional
        fields = ['id', 'nome', 'codigo_banco', 'agencia_conta', 'numero_conta', 'chave_pix', 'tipo_chave_pix', 'cpf', 'cnpj']


class PlantaoMinSerializer(ModelSerializer):
    regra_pagamento_detalhe = RegraPagamentoSerializer(source="regra_pagamento", read_only=True)
    assistido_detalhe = AssistidoMinSerializer(source="assistido", read_only=True)
    profissional_detalhe = ProfissionalMinSerializer(source="profissional", read_only=True)
    status_name = SerializerMethodField()

    def get_status_name(self, obj):
        return obj.get_status_display()


    class Meta:
        model = Plantao
        fields = [
            'id', 'codigo_interno', 'regra_pagamento', 
            'regra_pagamento_detalhe', 'assistido_detalhe', 
            'profissional_detalhe', 'status_name', 'status',
            'horas', 'horas_cumpridas', 'inicio', 'fim',
            ]


class PagamentoSerializer(ModelSerializer):
    plantao_detalhe = PlantaoMinSerializer(source="plantao", read_only=True)
    status_name = SerializerMethodField()

    def get_status_name(self, obj):
        return obj.get_status_display()

    class Meta:
        model = Pagamento
        fields = "__all__"


class RelatorioSerializer(ModelSerializer):
    status_name = SerializerMethodField()
    profissional_detalhe = ProfissionalMinSerializer(source="profissional", read_only=True)
    pagamentos_count = serializers.IntegerField(read_only=True)
    pagamentos = PagamentoSerializer(many=True, read_only=True)

    def get_status_name(self, obj):
        return obj.get_status_display()

    class Meta:
        model = Relatorio
        fields = "__all__"



