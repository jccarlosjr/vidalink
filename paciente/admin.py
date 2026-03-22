from django.contrib import admin
from .models import Paciente, Responsavel

# Register your models here.
@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'idade', 'sexo', 'cep', 'endereco', 'cidade', 'estado', 'responsavel', 'observacoes')
    list_filter = ('responsavel', 'cidade', 'estado')
    search_fields = ('nome', 'responsavel__nome')


@admin.register(Responsavel)
class ResponsavelAdmin(admin.ModelAdmin):
    list_display = ('nome', 'telefone')
    search_fields = ('nome', 'telefone')
