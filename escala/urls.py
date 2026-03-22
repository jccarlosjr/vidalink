from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api/escalas', views.EscalaViewSet)

urlpatterns = router.urls