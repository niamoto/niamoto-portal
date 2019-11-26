from django.urls import include, path
from rest_framework import routers
from . import views

router = routers.SimpleRouter()
router.register(r'Plot', views.PlotsViewSet, base_name='plot')
router.register(r'Shape', views.ShapesViewSet, base_name='shape')
router.register(r'ShapeLocation', views.ShapeLocationViewSet,
                base_name='shapeLocation')
router.register(r'Taxon', views.taxonsViewSet, base_name='taxon')
router.register(r'TaxonTree', views.taxonsTreeViewSet, base_name='taxon_tree')

urlpatterns = [
    path('', include(router.urls)),
]
