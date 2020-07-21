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
    land_holdridge1 = models.FloatField(null=True, blank=True)
    land_holdridge2 = models.FloatField(null=True, blank=True)
    land_holdridge3 = models.FloatField(null=True, blank=True)
    forest_area = models.FloatField(null=True, blank=True)
    forest_um_area = models.FloatField(null=True, blank=True)
    forest_in = models.FloatField(null=True, blank=True)
    forest_reserve = models.FloatField(null=True, blank=True)
    forest_mining = models.FloatField(null=True, blank=True)
    forest_perimeter = models.FloatField(null=True, blank=True)
    forest_secondary = models.FloatField(null=True, blank=True)
    forest_primary = models.FloatField(null=True, blank=True)
    forest_heart = models.FloatField(null=True, blank=True)
    forest_inf_300 = models.FloatField(null=True, blank=True)
    forest_300_600 = models.FloatField(null=True, blank=True)
    forest_sup_600 = models.FloatField(null=True, blank=True)
    forest_holdridge1 = models.FloatField(null=True, blank=True)
    forest_holdridge2 = models.FloatField(null=True, blank=True)
    forest_holdridge3 = models.FloatField(null=True, blank=True)
    forest_cover = models.FloatField(null=True, blank=True)
    forest_cover_um = models.FloatField(null=True, blank=True)
    forest_cover_num = models.FloatField(null=True, blank=True)
    forest_ppe = models.FloatField(null=True, blank=True)
    reserve_area = models.FloatField(null=True, blank=True)
    reserve_um_area = models.FloatField(null=True, blank=True)
    mining_area = models.FloatField(null=True, blank=True)
    mining_um_area = models.FloatField(null=True, blank=True)
    min_rainfall = models.FloatField(null=True, blank=True)
    max_rainfall = models.FloatField(null=True, blank=True)
    ppe_area = models.FloatField(null=True, blank=True)
    nb_patchs = models.IntegerField(null=True, blank=True)
    nb_patchs_in = models.IntegerField(null=True, blank=True)
    r_in_median = models.FloatField(null=True, blank=True)
    nb_plots = models.IntegerField(null=True, blank=True)
    nb_occurence = models.IntegerField(null=True, blank=True)
    nb_families = models.IntegerField(null=True, blank=True)
    nb_species = models.IntegerField(null=True, blank=True)
    n_unique_species = models.IntegerField(null=True, blank=True)
    fragment_meff_cbc = models.FloatField(null=True, blank=True)
    um_geom = models.MultiPolygonField(null=True, srid=4326, blank=True)
    forest_geom = models.MultiPolygonField(null=True, srid=4326, blank=True)

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

    def __str__(self):
        return self.label
