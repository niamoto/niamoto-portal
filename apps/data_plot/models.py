from django.contrib.gis.db import models

# Create your models here.


class Plot(models.Model):
    """
    Model representing a forest plot.
    """

    label = models.CharField(max_length=50, unique=True)
    width = models.FloatField(null=True, blank=True)  # Meters
    height = models.FloatField(null=True, blank=True)  # Meters
    location = models.PointField(null=True, srid=4326)
    elevation = models.FloatField(null=True, blank=True)
    species_level = models.FloatField(null=True, blank=True)
    total_stems = models.IntegerField(null=True, blank=True)
    living_stems = models.IntegerField(null=True, blank=True)
    count_families = models.IntegerField(null=True, blank=True)
    count_species = models.IntegerField(null=True, blank=True)
    shannon = models.FloatField(null=True, blank=True)
    pielou = models.FloatField(null=True, blank=True)
    simpson = models.FloatField(null=True, blank=True)
    basal_area = models.FloatField(null=True, blank=True)
    h_mean = models.FloatField(null=True, blank=True)
    dbh_mean = models.FloatField(null=True, blank=True)
    dbh_median = models.FloatField(null=True, blank=True)
    dbh_min = models.FloatField(null=True, blank=True)
    dbh_max = models.FloatField(null=True, blank=True)
    wood_density_mean = models.FloatField(null=True, blank=True)
    biomass = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    holdridge = models.IntegerField(null=True, blank=True)
    rainfall = models.IntegerField(null=True, blank=True)
    um_substrat = models.BooleanField(null=True, blank=True)
    town = models.CharField(max_length=50, null=True, blank=True)


    def __str__(self):
        return self.label


class Frequency(models.Model):
    """Model definition for Frequency."""

    plot = models.ForeignKey(
        Plot, related_name='frequencies', on_delete=models.DO_NOTHING)
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
        return str(self.plot.label) + ' ' + self.class_name

    class Meta:
        ordering = ['class_object', 'class_index']


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
