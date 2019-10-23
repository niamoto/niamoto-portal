from django.urls import include, path
from rest_framework import routers
from . import views

router = routers.SimpleRouter()
router.register(r'Plot', views.PlosViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
