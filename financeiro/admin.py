from django.contrib import admin
from .models import Pagamento, Relatorio, RegraPagamento


@admin.register(Pagamento)
class PagamentoAdmin(admin.ModelAdmin):
    list_display = ('id', 'plantao__id', 'valor_calculado', 'valor_pago', 'data_pagamento', 'status')
    search_fields = ('plantao__id', 'status')


@admin.register(Relatorio)
class RelatorioAdmin(admin.ModelAdmin):
    list_display = ('codigo_interno', 'cuidadora__nome', 'status', 'valor_total', 'valor_liquido', 'created_at', 'updated_at')
    search_fields = ('codigo_interno', 'cuidadora__nome', 'status', 'created_at', 'updated_at')


@admin.register(RegraPagamento)
class RegraPagamentoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tipo', 'valor_base', 'ativa', 'data_inicio', 'data_fim')
    search_fields = ('nome', 'tipo')
