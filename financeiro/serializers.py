from rest_framework.serializers import ModelSerializer
from .models import Pagamento, Relatorio, RegraPagamento


class PagamentoSerializer(ModelSerializer):
    class Meta:
        model = Pagamento
        fields = "__all__"


class RelatorioSerializer(ModelSerializer):
    class Meta:
        model = Relatorio
        fields = "__all__"


class RegraPagamentoSerializer(ModelSerializer):
    class Meta:
        model = RegraPagamento
        fields = "__all__"
