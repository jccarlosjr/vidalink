from rest_framework.routers import DefaultRouter
from django.contrib.auth import views as auth_view
from django.urls import path
from . import views

router = DefaultRouter()
router.register(r'api/users', views.CustomUserViewSet)

urlpatterns = [
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('logout/', auth_view.LogoutView.as_view(next_page='login'), name='logout'),
]

urlpatterns += router.urls