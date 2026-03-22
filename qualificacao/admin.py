from django.contrib import admin
from .models import Qualificacao

# Register your models here.
@admin.register(Qualificacao)
class QualificacaoAdmin(admin.ModelAdmin):
    list_display = ('instituicao', 'data', 'descricao', 'certificado', 'usuario__username')
    search_fields = ('instituicao', 'data', 'descricao', 'certificado', 'usuario__username')
