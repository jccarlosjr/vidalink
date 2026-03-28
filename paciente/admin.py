from django.contrib import admin
from .models import Paciente, Responsavel

# Register your models here.
@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'idade', 'sexo', 'cep', 'endereco', 'cidade', 'estado', 'observacoes')
    list_filter = ('cidade', 'estado')
    search_fields = ('nome',)


@admin.register(Responsavel)
class ResponsavelAdmin(admin.ModelAdmin):
    list_display = ('nome', 'telefone', 'paciente')
    search_fields = ('nome', 'telefone', 'paciente__nome')
