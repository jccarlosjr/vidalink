from django.contrib import admin
from .models import Assistido, Responsavel


@admin.register(Assistido)
class AssistidoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'nascimento', 'sexo', 'cep', 'endereco', 'cidade', 'estado', 'observacoes')
    list_filter = ('cidade', 'estado')
    search_fields = ('nome',)


@admin.register(Responsavel)
class ResponsavelAdmin(admin.ModelAdmin):
    list_display = ('nome', 'telefone', 'assistido')
    search_fields = ('nome', 'telefone', 'assistido__nome')
