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
    id_endemia = models.IntegerField()
    id_rang = models.IntegerField()
    occ_count = models.IntegerField()
    plot_count = models.IntegerField()

    def __str__(self):
        return self.full_name

    class MPTTMeta:
        order_insertion_by = ['rank_name']


class Frequency(models.Model):
    """Model definition for Frequency."""

    taxon = models.ForeignKey(
        Taxon, related_name='frequencies', on_delete=models.DO_NOTHING)
    class_object = models.CharField(max_length=30)
    class_name = models.CharField(max_length=30)
    class_value = models.FloatField()
    param1_str = models.CharField(max_length=30, null=True, blank=True)
    param2_str = models.CharField(max_length=30, null=True, blank=True)
    param3_float = models.FloatField(null=True, blank=True)
    param4_float = models.FloatField(null=True, blank=True)

    def __str__(self):
        """Unicode representation of Frequency."""
        return self.class_name


class Graph(models.Model):
    """
    Class template data graph
    set the height and order on the page
    ability to create visualization profiles
    model reference to lib 3d
    """
    GRAPH_SIZES = (
        ('sm', 'Small'),
        ('md', 'Medium'),
        ('lg', 'Large'),
    )
    label = models.CharField(max_length=30)
    title = models.CharField(max_length=30)
    model = models.CharField(max_length=30)
    sort = models.IntegerField()
    height = models.CharField(max_length=2, choices=GRAPH_SIZES, default='md')
    show = models.BooleanField(default=True)
    profil = models.CharField(max_length=30, default='default')

    def __str__(self):
        return self.label
