from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api/users', views.CustomUserViewSet)

# urlpatterns = [
#     path('users/', views.UsersView.as_view(), name='users'),
# ]

urlpatterns = router.urls