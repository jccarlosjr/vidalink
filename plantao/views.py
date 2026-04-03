from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from escala.models import Escala
from .serializers import PlantaoSerializer
from .models import Plantao
from datetime import datetime
from django.db import transaction


class PlantaoViewSet(ModelViewSet):
    serializer_class = PlantaoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Plantao.objects.all()
    pagination_class = None

    def get_queryset(self):
        if self.request.query_params.get("paciente"):
            return Plantao.objects.filter(paciente_id=self.request.query_params.get("paciente"))

        return Plantao.objects.all()


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