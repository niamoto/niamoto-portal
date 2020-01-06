from django.contrib.gis.db import models

# Create your models here.


class Shape(models.Model):
    """
    Model representing a forest plot.
    """

    label = models.CharField(max_length=50, unique=True)
    type_shape = models.CharField(max_length=50, null=True, blank=True)
    location = models.MultiPolygonField(null=True, srid=4326, blank=True)
    elevation = models.FloatField(null=True, blank=True)
    land_area = models.FloatField(null=True, blank=True)
    um_area = models.FloatField(null=True, blank=True)
    forest_area = models.FloatField(null=True, blank=True)
    forest_um_area = models.FloatField(null=True, blank=True)
    forest_perimeter = models.FloatField(null=True, blank=True)
    nb_patchs = models.IntegerField(null=True, blank=True)
    nb_patchs_in = models.IntegerField(null=True, blank=True)
    forest_in = models.FloatField(null=True, blank=True)
    r_in_median = models.FloatField(null=True, blank=True)
    nb_occurence = models.IntegerField(null=True, blank=True)
    nb_families = models.IntegerField(null=True, blank=True)
    nb_species = models.IntegerField(null=True, blank=True)
    n_unique_species = models.IntegerField(null=True, blank=True)
    um_geom = models.MultiPolygonField(null=True, srid=4326, blank=True)

    def __str__(self):
        return self.label


class Frequency(models.Model):
    """Model definition for Frequency."""

    shape = models.ForeignKey(
        Shape, related_name='frequencies', on_delete=models.DO_NOTHING)
    class_object = models.CharField(max_length=30)
    class_name = models.CharField(max_length=30)
    class_value = models.FloatField()
    param1_str = models.CharField(max_length=30, null=True, blank=True)
    param2_str = models.CharField(max_length=30, null=True, blank=True)
    param3_float = models.FloatField(null=True, blank=True)
    param4_float = models.FloatField(null=True, blank=True)

    def __str__(self):
        """Unicode representation of Frequency."""
        return str(self.shape) + ' ' + self.class_name


class Graph(models.Model):
    """
    Class template data graph
    set the height and order on the page
    ability to create visualization profiles
    model reference to lib 3d
    """
    GRAPH_SIZES = (
        ('25', 'Small'),
        ('50', 'Medium'),
        ('75', 'Large'),
        ('100', 'XLarge'),
    )
    label = models.CharField(max_length=30)
    title = models.CharField(max_length=30)
    model = models.CharField(max_length=30)
    sort = models.IntegerField()
    height = models.CharField(max_length=3, choices=GRAPH_SIZES, default='25')
    show = models.BooleanField(default=True)
    profil = models.CharField(max_length=30, default='default')

    def __str__(self):
        return self.label
