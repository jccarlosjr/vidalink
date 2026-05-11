from django.db.models import Q
from .models import Plantao
from datetime import datetime
from financeiro.models import RegraPagamento
from decimal import Decimal, ROUND_CEILING


class PlantaoValidator:

    @staticmethod
    def validar_intervalo(inicio, fim, profissional_id, instance_id=None):
        qs = Plantao.objects.filter(profissional_id=profissional_id)

        if instance_id:
            qs = qs.exclude(id=instance_id)

        conflito = qs.filter(
            Q(inicio__lt=fim) & Q(fim__gt=inicio)
        ).exists()

        if conflito:
            raise ValueError("Conflito de horário com plantão existente, esse(a) profissional já possui um ou mais plantões criados para essas datas/horários")


    @staticmethod
    def validar_lote(plantoes, profissional_id):
        intervalos = []

        for p in plantoes:
            inicio = datetime.fromisoformat(p["inicio"])
            fim = datetime.fromisoformat(p["fim"])

            for i_inicio, i_fim in intervalos:
                if inicio < i_fim and fim > i_inicio:
                    raise ValueError("Conflito de horário com plantão existente, esse(a) profissional já possui um ou mais plantões criados para essas datas/horários")

            intervalos.append((inicio, fim))

            PlantaoValidator.validar_intervalo(inicio, fim, profissional_id)


    @staticmethod
    def calcular_valor_plantao(plantao):
        regra = plantao.regra_pagamento

        if regra.tipo == RegraPagamento.Tipo.HORA:
            if regra.valor_base is None:
                raise Exception("Regra de pagamento por hora sem valor_base definido")

            horas = Decimal(str(plantao.horas_cumpridas))

            valor = horas * regra.valor_base
            return valor.quantize(Decimal("0.01"), rounding=ROUND_CEILING)

        elif regra.tipo == RegraPagamento.Tipo.PLANTAO:
            if regra.valor_base is None:
                raise Exception("Regra de pagamento por plantão sem valor_base definido")

            return regra.valor_base

        raise Exception("Tipo de regra de pagamento inválido")