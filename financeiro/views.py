from rest_framework.viewsets import ModelViewSet
from .models import Pagamento, Relatorio,  RegraPagamento
from .serializers import PagamentoSerializer, RelatorioSerializer, RegraPagamentoSerializer
from rest_framework.permissions import IsAuthenticated


class PagamentoViewSet(ModelViewSet):
    serializer_class = PagamentoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Pagamento.objects.all()


class RelatorioViewSet(ModelViewSet):
    serializer_class = RelatorioSerializer
    permission_classes = [IsAuthenticated]
    queryset = Relatorio.objects.all()


class RegraPagamentoViewSet(ModelViewSet):
    serializer_class = RegraPagamentoSerializer
    permission_classes = [IsAuthenticated]
    queryset = RegraPagamento.objects.all()
