from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api/assistidos', views.AssistidoViewSet)
router.register(r'api/responsaveis', views.ResponsavelViewSet)

urlpatterns = [
    path('assistidos/', views.AssistidosListView.as_view(), name='assistidos'),
]

urlpatterns += router.urls