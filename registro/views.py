from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from registro.models import EventoPlantao
from django.views.generic import DetailView
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Plantao, EventoPlantao
from django.utils import timezone


class PlantaoViewSet(ModelViewSet):
    queryset = Plantao.objects.all()

    @action(detail=True, methods=['post'])
    def registrar_evento(self, request, pk=None):
        plantao = self.get_object()

        if request.user != plantao.cuidadora:
            return Response({"error": "Sem permissão"}, status=403)

        tipo = request.data.get("tipo")
        lat = request.data.get("lat")
        lng = request.data.get("lng")
        precisao = request.data.get("accuracy")
        endereco = request.data.get("endereco")

        if tipo not in ['I', 'F']:
            return Response({"error": "Tipo inválido"}, status=400)

        if not lat or not lng:
            return Response({"error": "Geolocalização obrigatória"}, status=400)

        if tipo == 'I' and plantao.eventos.filter(tipo='I').exists():
            return Response({"error": "Já iniciado"}, status=400)

        if tipo == 'F' and not plantao.eventos.filter(tipo='I').exists():
            return Response({"error": "Plantão ainda não iniciado"}, status=400)

        # 🔥 cria evento
        evento = EventoPlantao.objects.create(
            plantao=plantao,
            tipo=tipo,
            latitude=lat,
            longitude=lng,
            precisao=precisao,
            endereco=endereco
        )

        # 🔥 ATUALIZA STATUS + HORAS
        if tipo == 'I':
            plantao.status = 'R'

        elif tipo == 'F':
            plantao.status = 'F'

            inicio_evento = plantao.eventos.filter(tipo='I').order_by('data_hora').first()

            if inicio_evento:
                delta = evento.data_hora - inicio_evento.data_hora

                horas = delta.total_seconds() / 3600  # horas decimais
                plantao.horas_cumpridas = round(horas, 2)

        plantao.save()

        return Response({"success": True})


class RegistroExecucaoView(LoginRequiredMixin, DetailView):
    model = Plantao
    template_name = "registro.html"
    context_object_name = "plantao"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        eventos = self.object.eventos.all().order_by('data_hora')

        context['eventos'] = eventos
        context['iniciado'] = eventos.filter(tipo='I').exists()
        context['finalizado'] = eventos.filter(tipo='F').exists()

        return context
