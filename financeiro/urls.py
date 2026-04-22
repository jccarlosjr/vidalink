from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api/pagamento', views.PagamentoViewSet)
router.register(r'api/relatorio', views.RelatorioViewSet)
router.register(r'api/faixa-pagamento', views.FaixaPagamentoViewSet)
router.register(r'api/regra-pagamento', views.RegraPagamentoViewSet)

urlpatterns = router.urls