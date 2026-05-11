from . import views
from rest_framework.routers import DefaultRouter
from django.urls import path
from django.contrib.auth import views as auth_views

router = DefaultRouter()
router.register(r'api/profissionais', views.ProfissionalViewSet)

urlpatterns = [
    path('profissionais/', views.ProfissionaisView.as_view(), name='profissionais'),
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
]

urlpatterns += router.urls