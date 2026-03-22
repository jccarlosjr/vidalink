from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api/pacientes', views.PacienteViewSet)
router.register(r'api/responsaveis', views.ResponsavelViewSet)

# urlpatterns = [
#     path('pacientes/', views.PacientesView.as_view(), name='pacientes'),
# ]

urlpatterns = router.urls