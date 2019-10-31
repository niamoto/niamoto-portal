from django.urls import include, path
from rest_framework import routers
from . import views

router = routers.SimpleRouter()
router.register(r'Plot', views.PlotsViewSet, base_name='plot')
router.register(r'Shape', views.ShapesViewSet, base_name='shape')

urlpatterns = [
    path('', include(router.urls)),
]
