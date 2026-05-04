from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api/pagamento', views.PagamentoViewSet)
router.register(r'api/relatorios', views.RelatorioViewSet)
router.register(r'api/regra-pagamento', views.RegraPagamentoViewSet)

urlpatterns = [
    path('regras-de-pagamento/', views.RegraPagamentoView.as_view(), name='regra_pagamento'),
    path('pagamentos/', views.PagamentoView.as_view(), name='pagamento'),
    path('relatorios/', views.RelatorioView.as_view(), name='relatorio'),
]

urlpatterns += router.urls