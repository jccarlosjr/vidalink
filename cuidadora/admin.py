from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Cuidadora

class CuidadoraAdmin(UserAdmin):
    list_display = [
        'username', 'first_name', 
        'is_staff', 'is_superuser', 
        'is_active', 'last_login',
        'date_joined'
        ]
    fieldsets = (
        ('Personal info', 
         {
             'fields': 
             (
                'username', 'password', 'nome',
                'cpf', 'cnpj', 'nascimento',
                'telefone', 'cep', 'endereco',
                'numero', 'complemento', 'bairro',
                'cidade', 'estado'
            )
         }
        ),
        ('Financial Info', 
         {
             'fields': 
             (
                'chave_pix', 'tipo_chave_pix', 'nome_banco',
                'codigo_banco', 'tipo_conta', 'numero_conta',
                'agencia_conta'
            )
         }
        ),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
    )


admin.site.register(Cuidadora, CuidadoraAdmin)