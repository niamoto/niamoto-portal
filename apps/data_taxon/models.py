from django.contrib.gis.db import models
from mptt.models import MPTTModel, TreeForeignKey

# Create your models here.


class Taxon(MPTTModel):
    """
    Model representing a taxon (family or genus or specie or infra).
    """

    full_name = models.CharField(max_length=300)
    rank_name = models.CharField(max_length=300)
    parent = TreeForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='children',
        db_index=True,
        on_delete=models.CASCADE
    )
    id_endemia = models.IntegerField(null=True, blank=True)
    id_florical = models.IntegerField(null=True, blank=True)
    id_rang = models.IntegerField()
    occ_count = models.IntegerField(null=True, blank=True)
    occ_um_count = models.IntegerField(null=True, blank=True)
    freq_max = models.FloatField(null=True, blank=True)
    freq10_max = models.FloatField(null=True, blank=True)
    freq_plot1ha_max = models.FloatField(null=True, blank=True)
    dbh_avg = models.FloatField(null=True, blank=True)
    dbh_max = models.FloatField(null=True, blank=True)
    dbh_median = models.FloatField(null=True, blank=True)
    height_max = models.FloatField(null=True, blank=True)
    leaf_type = models.CharField(null=True, blank=True, max_length=300)
    sexual_system = models.CharField(null=True, blank=True, max_length=300)
    fleshy_fruit = models.CharField(null=True, blank=True, max_length=30)
    wood_density_avg = models.FloatField(null=True, blank=True)
    wood_density_min = models.FloatField(null=True, blank=True)
    wood_density_max = models.FloatField(null=True, blank=True)
    bark_thickness_avg = models.FloatField(null=True, blank=True)
    bark_thickness_min = models.FloatField(null=True, blank=True)
    bark_thickness_max = models.FloatField(null=True, blank=True)
    leaf_sla_avg = models.FloatField(null=True, blank=True)
    leaf_sla_min = models.FloatField(null=True, blank=True)
    leaf_sla_max = models.FloatField(null=True, blank=True)
    leaf_area_avg = models.FloatField(null=True, blank=True)
    leaf_area_min = models.FloatField(null=True, blank=True)
    leaf_area_max = models.FloatField(null=True, blank=True)
    leaf_thickness_avg = models.FloatField(null=True, blank=True)
    leaf_thickness_min = models.FloatField(null=True, blank=True)
    leaf_thickness_max = models.FloatField(null=True, blank=True)
    leaf_ldmc_avg = models.FloatField(null=True, blank=True)
    leaf_ldmc_min = models.FloatField(null=True, blank=True)
    leaf_ldmc_max = models.FloatField(null=True, blank=True)
    ncpippn_count = models.IntegerField(null=True, blank=True)
    geo_pts_pn = models.MultiPointField(null=True, srid=4326, blank=True)

    def __str__(self):
        return self.full_name

    class MPTTMeta:
        order_insertion_by = ['rank_name']


class Frequency(models.Model):
    """Model definition for Frequency."""

    taxon = models.ForeignKey(
        Taxon, related_name='frequencies', on_delete=models.DO_NOTHING)
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
        return str(self.taxon) + ' ' + self.class_name


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
