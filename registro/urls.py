from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api/registro', views.PlantaoViewSet)

urlpatterns = [
    path('registro/<int:pk>/', views.RegistroExecucaoView.as_view(), name='registro_execucao'),
]

urlpatterns += router.urls