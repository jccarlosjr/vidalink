from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api/plantao', views.PlantaoViewSet)

urlpatterns = [
    path('plantoes/', views.PlantaoListView.as_view(), name='plantoes'),
]

urlpatterns += router.urls
