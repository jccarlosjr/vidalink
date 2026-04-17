from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from escala.models import Escala
from .serializers import PlantaoSerializer
from .models import Plantao
from datetime import datetime
from django.db import transaction
from django.views.generic import ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils import timezone
from datetime import timedelta


def expirar_plantoes():
    limite = timezone.now() - timedelta(hours=24)

    Plantao.objects.filter(
        fim__lt=limite
    ).exclude(status='E').update(status='E')


class PlantaoListView(ListView):
    template_name = "plantao_list.html"
    model = Plantao
    context_object_name = "plantoes"

    def get_context_data(self, **kwargs):
        expirar_plantoes()
        limite = timezone.now() - timedelta(days=90)

        plantoes = Plantao.objects.filter(updated_at__gte=limite).order_by('-updated_at')

        if self.request.user.is_superuser:
            plantoes = plantoes
        else:
            plantoes =plantoes.filter(cuidadora=self.request.user.cuidadora).order_by('-updated_at')

        plantoes_andamento = plantoes.filter(status__in=['A', 'P', 'C', 'R'])
        plantoes_finalizados = plantoes.filter(status='F')
        plantoes_expirados = plantoes.filter(status='E')

        context = {
            "plantoes_andamento": plantoes_andamento,
            "plantoes_finalizados": plantoes_finalizados,
            "plantoes_expirados": plantoes_expirados,
        }

        return context


class PlantaoViewSet(LoginRequiredMixin, ModelViewSet):
    serializer_class = PlantaoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Plantao.objects.all().order_by('-updated_at')
    pagination_class = None

    def get_queryset(self):
        expirar_plantoes()
        plantaoes = Plantao.objects.all().order_by('-updated_at')

        if self.request.query_params.get("paciente"):
            return plantaoes.filter(paciente_id=self.request.query_params.get("paciente")).order_by('-updated_at')

        if self.request.query_params.get("cuidadora"):
            return plantaoes.filter(cuidadora_id=self.request.query_params.get("cuidadora")).order_by('-updated_at')

        return plantaoes


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
                        escala=escala
                    ))

                Plantao.objects.bulk_create(objs)

            return Response({"status": "plantoes criados"})

        except KeyError:
            return Response({"erro": "Dados inválidos"}, status=400)

        except ValueError as e:
            return Response({"erro": str(e)}, status=400)