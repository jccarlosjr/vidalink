from . import views
from rest_framework.routers import DefaultRouter
from django.urls import path


router = DefaultRouter()
router.register(r'api/cuidadoras', views.CuidadoraViewSet)

urlpatterns = [
    path('cuidadoras/', views.CuidadorasView.as_view(), name='cuidadoras'),
]

urlpatterns += router.urls