from django.contrib.gis.db import models

# Create your models here.


class Plot(models.Model):
    """
    Model representing a forest plot.
    """

    name = models.CharField(max_length=50, unique=True)
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
    wood_density = models.FloatField(null=True, blank=True)
    biomasse = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name


class Frequency(models.Model):
    """Model definition for Frequency."""

    id_plot = models.ForeignKey(Plot, on_delete=models.CASCADE)
    class_object = models.CharField(max_length=30)
    class_name = models.CharField(max_length=30)
    class_data = models.FloatField()
    param1_str = models.CharField(max_length=30, null=True, blank=True)
    param2_str = models.CharField(max_length=30, null=True, blank=True)
    param3_float = models.FloatField(null=True, blank=True)
    param4_float = models.FloatField(null=True, blank=True)

    def __str__(self):
        """Unicode representation of Frequency."""
        return self.name
