from rest_framework import serializers
from .models import Plantao, HistoricoPlantao
from assistido.models import Assistido
from profissional.serializers import ProfissionalSerializer
from profissional.models import Profissional
from assistido.serializers import AssistidoSerializer
from financeiro.models import RegraPagamento
from financeiro.serializers import RegraPagamentoSerializer


class PlantaoSerializer(serializers.ModelSerializer):
    profissional_nome = serializers.CharField(source='profissional.nome', read_only=True)
    assistido_nome = serializers.CharField(source='assistido.nome', read_only=True)
    escala_codigo_interno = serializers.CharField(source='escala.codigo_interno', read_only=True)
    status_name = serializers.CharField(source='get_status_display', read_only=True)
    regra_pagamento_nome = serializers.CharField(source='regra_pagamento.nome', read_only=True)

    profissional = serializers.PrimaryKeyRelatedField(queryset=Profissional.objects.all())
    assistido = serializers.PrimaryKeyRelatedField(queryset=Assistido.objects.all())
    regra_pagamento = serializers.PrimaryKeyRelatedField(queryset=RegraPagamento.objects.all())

    profissional_detalhe = ProfissionalSerializer(source='profissional', read_only=True)
    assistido_detalhe = AssistidoSerializer(source='assistido', read_only=True)
    regra_pagamento_detalhe = RegraPagamentoSerializer(source='regra_pagamento', read_only=True)

    class Meta:
        model = Plantao
        fields = '__all__'


class HistoricoPlantaoSerializer(serializers.ModelSerializer):
    status_name = serializers.CharField(source='get_status_display', read_only=True)
    usuario = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = HistoricoPlantao
        fields = '__all__'