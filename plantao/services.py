from django.db.models import Q
from .models import Plantao
from datetime import datetime
from financeiro.models import RegraPagamento
from decimal import Decimal


class PlantaoValidator:

    @staticmethod
    def validar_intervalo(inicio, fim, cuidadora_id, instance_id=None):
        qs = Plantao.objects.filter(cuidadora_id=cuidadora_id)

        if instance_id:
            qs = qs.exclude(id=instance_id)

        conflito = qs.filter(
            Q(inicio__lt=fim) & Q(fim__gt=inicio)
        ).exists()

        if conflito:
            raise ValueError("Conflito de horário com plantão existente, esse(a) cuidador(a) já possui um ou mais plantões criados para essas datas/horários")

    @staticmethod
    def validar_lote(plantoes, cuidadora_id):
        intervalos = []

        for p in plantoes:
            inicio = datetime.fromisoformat(p["inicio"])
            fim = datetime.fromisoformat(p["fim"])

            for i_inicio, i_fim in intervalos:
                if inicio < i_fim and fim > i_inicio:
                    raise ValueError("Conflito de horário com plantão existente, esse(a) cuidador(a) já possui um ou mais plantões criados para essas datas/horários")

            intervalos.append((inicio, fim))

            PlantaoValidator.validar_intervalo(inicio, fim, cuidadora_id)


    @staticmethod
    def calcular_valor_plantao(plantao):
        regra = plantao.regra_pagamento

        if regra.tipo == RegraPagamento.Tipo.HORA:
            if regra.valor_base is None:
                raise Exception("Regra de pagamento por hora sem valor_base definido")

            return Decimal(plantao.horas_cumpridas) * regra.valor_base

        elif regra.tipo == RegraPagamento.Tipo.PLANTAO:
            if regra.valor_base is None:
                raise Exception("Regra de pagamento por plantão sem valor_base definido")

            return regra.valor_base

        raise Exception("Tipo de regra de pagamento inválido")
