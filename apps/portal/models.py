from django.db import models

# Create your models here.


class Graph(models.Model):
    """
    Class template data graph
    assign to an application
    set the height and order on the page
    ability to create visualization profiles
    model reference to lib 3d
    """
    GRAPH_SIZES = (
        ('sm', 'Small'),
        ('md', 'Medium'),
        ('lg', 'Large'),
    )
    APP = (
        ('P', 'Plot'),
        ('T', 'Taxon'),
        ('F', 'Footprint'),
    )
    name = models.CharField(max_length=30)
    title = models.CharField(max_length=30)
    model = models.CharField(max_length=30)
    app = models.CharField(max_length=1, choices=APP)
    order = models.IntegerField()
    height = models.CharField(max_length=2, choices=GRAPH_SIZES)
    show = models.BooleanField(default=True)
    profil = models.CharField(max_length=30, default='default')
