from . import views
from rest_framework.routers import DefaultRouter
from django.urls import path
from django.contrib.auth import views as auth_views


router = DefaultRouter()
router.register(r'api/cuidadoras', views.CuidadoraViewSet)

urlpatterns = [
    path('cuidadoras/', views.CuidadorasView.as_view(), name='cuidadoras'),
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
]

urlpatterns += router.urls