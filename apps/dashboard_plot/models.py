from django.db import models

# Create your models here.
class Plot(models.Model):
    """
    Model representing a forest plot.
    """

    name = models.CharField(max_length=50, unique=True)
    width = models.FloatField(null=True, blank=True)  # Meters
    height = models.FloatField(null=True, blank=True)  # Meters
    location = models.PointField(null=True, srid=4326)
    latitude = models.FloatField(blank=True)
    longitude = models.FloatField(blank=True)
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
    ferns = models.IntegerField(null=True, blank=True)
    palms = models.IntegerField(null=True, blank=True)
    lianas = models.IntegerField(null=True, blank=True)
    emergent = models.IntegerField(null=True, blank=True)
    canopy = models.IntegerField(null=True, blank=True)
    undercanopy = models.IntegerField(null=True, blank=True)
    understorey = models.IntegerField(null=True, blank=True)
    strate_indet = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name