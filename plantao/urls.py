from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api/plantao', views.PlantaoViewSet)

urlpatterns = router.urls
