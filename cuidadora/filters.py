import django_filters
from .models import Cuidadora


class CuidadoraFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search")

    def filter_search(self, queryset, name, value):
        try:
            type, value = value.split(":", 1)
        except ValueError:
            return queryset

        allowed_fields = {"nome", "cpf", "cnpj", "telefone"}

        if type in allowed_fields and value:
            return queryset.filter(**{f"{type}__icontains": value})

        return queryset

    class Meta:
        model = Cuidadora
        fields = []

