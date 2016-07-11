# coding: utf-8

from django.contrib.gis.db import models
from mptt.models import MPTTModel, TreeForeignKey


# ====================#
# Abiotic data models #
# ====================#

class Massif(models.Model):
    """
    Model representing a massif of the new caledonia's mountain chain.
    """

    key_name = models.CharField(max_length=30, unique=True)
    full_name = models.CharField(max_length=30, unique=True)
    geom = models.PolygonField(srid=4326, blank=True, null=True)

    objects = models.GeoManager()

    def __str__(self):
        return self.full_name


# ===================#
# Biotic data models #
# ===================#

class Taxon(MPTTModel):
    """
    Model representing a taxon (family or genus or specie or infra).
    """

    FAMILY = "FAMILY"
    GENUS = "GENUS"
    SPECIE = "SPECIE"
    INFRA = "INFRA"
    RANK_CHOICES = (
        (FAMILY, "Famille"),
        (GENUS, "Genre"),
        (SPECIE, "Espèce"),
        (INFRA, "Infra"),
    )

    id = models.IntegerField(primary_key=True)
    full_name = models.CharField(max_length=300)
    rank_name = models.CharField(max_length=300)
    parent = TreeForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='children',
        db_index=True,
    )
    rank = models.CharField(max_length=50, choices=RANK_CHOICES)

    def __str__(self):
        return self.full_name

    class MPTTMeta:
        order_insertion_by = ['rank_name']


class Occurrence(models.Model):
    """
    Model representing a plant occurrence, in it's simplest form, i.e.
    a unique identifier, a geographic location, a taxon (if identified),
    """

    id = models.CharField(primary_key=True, max_length=20)
    date = models.DateField(null=True, blank=True)
    taxon = models.ForeignKey(Taxon, null=True, blank=True)
    location = models.PointField(srid=4326, null=True, blank=True)


class ForestFragment(models.Model):
    """
    Represent a forest fragment zone.
    """
    uuid = models.UUIDField()
    geom = models.MultiPolygonField(srid=4326)

    objects = models.GeoManager()
