from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from escala.models import Escala
from .serializers import PlantaoSerializer
from .models import Plantao
from datetime import datetime
from django.db import transaction
from django.views.generic import TemplateView
from app.mixins import StaffRequiredMixin
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils import timezone
from datetime import timedelta
from .services import PlantaoValidator
from rest_framework import serializers
from django.db.models import Sum


def expirar_plantoes():
    limite = timezone.now() - timedelta(hours=24)

    Plantao.objects.filter(
        fim__lt=limite
    ).exclude(status='E').exclude(status='F').update(status='E')


def get_internal_code(tipo, id):
    plantao_id = str(id).zfill(5)
    data = timezone.now().strftime("%d%m%Y")
    return f"{tipo}-{data}-{plantao_id}"



class PlantaoListView(LoginRequiredMixin, TemplateView):
    template_name = "plantao_list.html"


class PlantaoAdminListView(StaffRequiredMixin, LoginRequiredMixin, TemplateView):
    template_name = "plantao_admin_list.html"


class PlantaoViewSet(ModelViewSet):
    serializer_class = PlantaoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Plantao.objects.all().order_by('inicio')
    pagination_class = None

    def _validar_plantao(self, data, instance=None):
        try:
            inicio = datetime.fromisoformat(data.get("inicio"))
            fim = datetime.fromisoformat(data.get("fim"))

            cuidadora_id = data.get("cuidadora")

            if not cuidadora_id and instance:
                cuidadora_id = instance.cuidadora_id

            PlantaoValidator.validar_intervalo(
                inicio,
                fim,
                cuidadora_id,
                instance_id=instance.id if instance else None
            )

        except ValueError as e:
            raise serializers.ValidationError({"erro": str(e)})


    def get_queryset(self):
        expirar_plantoes()
        if self.request.query_params.get("cuidadora"):
            plantaoes = Plantao.objects.filter(cuidadora=self.request.query_params.get("cuidadora")).order_by('inicio')
        elif self.request.user.is_superuser:
            plantaoes = Plantao.objects.all().order_by('inicio')
        else:
            plantaoes = Plantao.objects.filter(cuidadora=self.request.user.cuidadora).order_by('inicio')

        filter_type = self.request.query_params.get('filter_type', None)
        filter_value = self.request.query_params.get('filter_value', None)

        if filter_type and filter_value:
            plantaoes = plantaoes.filter(**{filter_type + "__icontains": filter_value})

        if self.request.query_params.get("data_inicio"):
            plantaoes = plantaoes.filter(inicio__gte=self.request.query_params.get("data_inicio")).order_by('inicio')

        if self.request.query_params.get("data_fim"):
            plantaoes = plantaoes.filter(fim__lte=self.request.query_params.get("data_fim")).order_by('inicio')

        return plantaoes


    def create(self, request, *args, **kwargs):
        self._validar_plantao(request.data)
        return super().create(request, *args, **kwargs)


    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        data = request.data.copy()

        data.setdefault("inicio", instance.inicio.isoformat())
        data.setdefault("fim", instance.fim.isoformat())
        data.setdefault("cuidadora", instance.cuidadora_id)

        self._validar_plantao(data, instance)

        return super().update(request, *args, **kwargs)


    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        data = request.data.copy()

        data["inicio"] = data.get("inicio", instance.inicio.isoformat())
        data["fim"] = data.get("fim", instance.fim.isoformat())
        data["cuidadora"] = data.get("cuidadora", instance.cuidadora_id)

        self._validar_plantao(data, instance)

        return super().partial_update(request, *args, **kwargs)


    @action(detail=False, methods=["get"], url_path="plantoes_finalizados_by_user")
    def plantoes_finalizados_by_user(self, request):
        cuidadora_id = request.query_params.get("cuidadora")
        plantoes = Plantao.objects.filter(cuidadora=cuidadora_id, inicio__gte=timezone.now() - timedelta(days=90))
        horas_cumpridas_total = plantoes.aggregate(total=Sum('horas_cumpridas'))['total'] or 0
        horas_devidas = plantoes.aggregate(total=Sum('horas'))['total'] or 0
        total_plantoes = plantoes.count()
        plantoes_finalizados = plantoes.filter(status='F').count()
        plantoes_expirados = plantoes.filter(status='E').count()

        return Response({
            "total_plantoes": total_plantoes,
            "horas_devidas": horas_devidas,
            "horas_cumpridas_total": horas_cumpridas_total,
            "plantoes_finalizados": plantoes_finalizados,
            "plantoes_expirados": plantoes_expirados,
        })


    @action(detail=False, methods=["post"])
    def lote(self, request):
        plantoes = request.data.get("plantoes", [])

        if not plantoes:
            return Response({"erro": "Nenhum plantão enviado"}, status=400)

        try:
            with transaction.atomic():
                primeiro = plantoes[0]

                paciente_id = primeiro["paciente"]
                cuidadora_id = primeiro["cuidadora"]
                regra_pagamento_id = primeiro["regra_pagamento"]

                PlantaoValidator.validar_lote(plantoes, cuidadora_id)

                escala, _ = Escala.objects.get_or_create(
                    paciente_id=paciente_id,
                    cuidadora_id=cuidadora_id,
                    defaults={
                        "codigo_interno": f"{paciente_id}-{cuidadora_id}"
                    }
                )

                objs = []

                for p in plantoes:
                    if p["paciente"] != paciente_id or p["cuidadora"] != cuidadora_id:
                        raise ValueError("Todos os plantões devem ter o mesmo paciente/cuidadora")

                    inicio = datetime.fromisoformat(p["inicio"])
                    fim = datetime.fromisoformat(p["fim"])

                    objs.append(Plantao(
                        data=inicio.date(),
                        inicio=inicio,
                        fim=fim,
                        horas=int((fim - inicio).total_seconds() / 3600),
                        paciente_id=paciente_id,
                        cuidadora_id=cuidadora_id,
                        regra_pagamento_id=regra_pagamento_id,
                        escala=escala
                    ))

                created = Plantao.objects.bulk_create(objs)

                for obj in created:
                    obj.codigo_interno = get_internal_code("PLT", obj.id)

                Plantao.objects.bulk_update(created, ["codigo_interno"])

            return Response({"status": "plantoes criados"})

        except KeyError:
            return Response({"erro": "Dados inválidos"}, status=400)

        except ValueError as e:
            return Response({"erro": str(e)}, status=400)