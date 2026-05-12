from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api/plantao', views.PlantaoViewSet)
router.register(r'api/historico-plantao', views.HistoricoPlantaoViewSet)

urlpatterns = [
    path('plantoes/', views.PlantaoListView.as_view(), name='plantoes'),
    path('plantoes/admin/', views.PlantaoAdminListView.as_view(), name='plantoes_admin'),
]

urlpatterns += router.urls
