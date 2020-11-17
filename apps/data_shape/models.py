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
    land_um_area = models.FloatField(null=True, blank=True)
    forest_area = models.FloatField(null=True, blank=True)
    forest_um_area = models.FloatField(null=True, blank=True)
    forest_in = models.FloatField(null=True, blank=True)
    forest_reserve = models.FloatField(null=True, blank=True)
    forest_mining = models.FloatField(null=True, blank=True)
    forest_perimeter = models.FloatField(null=True, blank=True)
    nb_patchs = models.IntegerField(null=True, blank=True)
    nb_plots = models.IntegerField(null=True, blank=True)
    nb_occurence = models.IntegerField(null=True, blank=True)
    nb_families = models.IntegerField(null=True, blank=True)
    nb_species = models.IntegerField(null=True, blank=True)
    elevation_median = models.IntegerField(null=True, blank=True)
    elevation_max = models.IntegerField(null=True, blank=True)
    rainfall_min = models.IntegerField(null=True, blank=True)
    rainfall_max = models.IntegerField(null=True, blank=True)
    fragment_meff_cbc = models.FloatField(null=True, blank=True)
    geom_um = models.MultiPolygonField(null=True, srid=4326, blank=True)
    geom_forest = models.MultiPolygonField(null=True, srid=4326, blank=True)

    def __str__(self):
        return self.label


class Frequency(models.Model):
    """Model definition for Frequency."""

    shape = models.ForeignKey(
        Shape, related_name='frequencies', on_delete=models.DO_NOTHING)
    class_object = models.CharField(max_length=30)
    class_name = models.CharField(max_length=100)
    class_value = models.FloatField()
    param1_str = models.CharField(max_length=30, null=True, blank=True)
    param2_str = models.CharField(max_length=30, null=True, blank=True)
    param3_float = models.FloatField(null=True, blank=True)
    param4_float = models.FloatField(null=True, blank=True)
    class_index = models.IntegerField(null=True, blank=True)

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
    LEGEND_LOCATE = (
        ('right', 'right'),
        ('bottom', 'bottom'),
        ('left', 'left'),
        ('top', 'top'),
        ('nolegend', 'nolegend')
    )
    label = models.CharField(max_length=30)
    title = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    sort = models.IntegerField()
    height = models.CharField(
        max_length=3, choices=GRAPH_SIZES, default='25')
    show = models.BooleanField(default=True)
    profil = models.CharField(max_length=30, default='default')
    legend_locate = models.CharField(
        default='bottom', choices=LEGEND_LOCATE, max_length=10)
    legend_type = models.IntegerField(default=1)
    information = models.CharField(max_length=255, blank=True, default="")

    def __str__(self):
        return self.label
