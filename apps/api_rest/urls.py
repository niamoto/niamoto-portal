from django.urls import include, path
from rest_framework import routers
from . import views

router = routers.SimpleRouter()
router.register(r'Plot', views.PlotsViewSet, basename='plot')
router.register(r'Shape', views.ShapesViewSet, basename='shape')
router.register(r'ShapeLocation', views.ShapeLocationViewSet,
                basename='shapeLocation')
router.register(r'Taxon', views.taxonsViewSet, basename='taxon')
router.register(r'TaxonTree', views.taxonsTreeViewSet, basename='taxon_tree')

urlpatterns = [
    path('', include(router.urls)),
]
