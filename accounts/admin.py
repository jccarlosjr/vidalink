from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
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
                'username', 'password', 'first_name', 
                'last_name', 'email', 'cuidadora'
            )
         }
        ),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'cuidadora'),
        }),
    )


admin.site.register(CustomUser, CustomUserAdmin)