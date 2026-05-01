from rest_framework.serializers import ModelSerializer, SerializerMethodField, PrimaryKeyRelatedField
from .models import Pagamento, Relatorio, RegraPagamento
from plantao.models import Plantao
from paciente.models import Paciente
from cuidadora.models import Cuidadora


class RegraPagamentoSerializer(ModelSerializer):
    tipo_name = SerializerMethodField()

    def get_tipo_name(self, obj):
        return obj.get_tipo_display()

    class Meta:
        model = RegraPagamento
        fields = "__all__"


class PacienteMinSerializer(ModelSerializer):
    class Meta:
        model = Paciente
        fields = ['id', 'nome']


class CuidadoraMinSerializer(ModelSerializer):
    class Meta:
        model = Cuidadora
        fields = ['id', 'nome']


class PlantaoMinSerializer(ModelSerializer):
    regra_pagamento_detalhe = RegraPagamentoSerializer(source="regra_pagamento", read_only=True)
    paciente_detalhe = PacienteMinSerializer(source="paciente", read_only=True)
    cuidadora_detalhe = CuidadoraMinSerializer(source="cuidadora", read_only=True)
    status_name = SerializerMethodField()

    def get_status_name(self, obj):
        return obj.get_status_display()


    class Meta:
        model = Plantao
        fields = [
            'id', 'codigo_interno', 'regra_pagamento', 
            'regra_pagamento_detalhe', 'paciente_detalhe', 
            'cuidadora_detalhe', 'status_name', 'status',
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
    class Meta:
        model = Relatorio
        fields = "__all__"



