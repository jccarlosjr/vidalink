from rest_framework.routers import DefaultRouter
from . import views
from django.urls import path

router = DefaultRouter()
router.register(r'api/escalas', views.EscalaViewSet)

urlpatterns = [
    path('escalas/', views.EscalaView.as_view(), name='escalas'),
]

urlpatterns += router.urls