from django.apps import AppConfig

class PlantaoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'plantao'

    def ready(self):
        import plantao.signals
