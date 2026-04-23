from rest_framework.serializers import ModelSerializer, SerializerMethodField
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
    tipo_name = SerializerMethodField()

    def get_tipo_name(self, obj):
        return obj.get_tipo_display()

    class Meta:
        model = RegraPagamento
        fields = "__all__"
