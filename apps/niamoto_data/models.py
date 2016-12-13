# coding: utf-8

from django.contrib.gis.db import models
from django.db import connection, transaction
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


class Plot(models.Model):
    """
    Model representing a forest plot.
    """

    name = models.CharField(max_length=50, unique=True)
    width = models.FloatField(null=True, blank=True)  # Meters
    height = models.FloatField(null=True, blank=True)  # Meters
    location = models.PointField(srid=4326)
    elevation = models.FloatField(null=True, blank=True)

    objects = models.GeoManager()

    def __str__(self):
        return self.name


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

    date = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    taxon = models.ForeignKey(Taxon, null=True, blank=True)
    location = models.PointField(srid=4326, null=True, blank=True)

    objects = models.GeoManager()


class OccurrenceObservations(models.Model):
    """
    Model representing a set of observations / measures for occurrences.
    """
    occurrence = models.OneToOneField(
        Occurrence,
        unique=True,
        related_name="observations",
        primary_key=True
    )
    last_observation_date = models.CharField(
        max_length=50,
        null=True, blank=True
    )
    height = models.FloatField(null=True, blank=True)
    stem_nb = models.IntegerField(null=True, blank=True)
    circumference = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=50)
    wood_density = models.FloatField(null=True, blank=True)
    bark_thickness = models.FloatField(null=True, blank=True)
    elevation = models.FloatField(null=True, blank=True)


@transaction.atomic
def set_occurrences_elevation(occurrences_ids=None):
    if occurrences_ids is None:
        in_occs = 'NULL'
    else:
        in_occs = ','.join([str(i) for i in occurrences_ids])
    sql = \
    """
        WITH elev AS (
            SELECT occ.id AS id,
                ST_Value(mnt.rast, occ.location) AS elevation
            FROM {occ_table} AS occ
            LEFT JOIN {elev_raster_table} AS mnt
            ON ST_Intersects(mnt.rast, occ.location)
            WHERE {occ_ids} IS NULL OR occ.id IN ({occ_ids})
        )
        UPDATE {occ_obs}
        SET elevation = elev.elevation
        FROM elev
        WHERE elev.id = {occ_obs}.{occ_id_col};
    """.format(**{
        'occ_table': Occurrence._meta.db_table,
        'elev_raster_table': 'mnt10_wgs84',
        'occ_ids': in_occs,
        'occ_obs': OccurrenceObservations._meta.db_table,
        'occ_id_col': OccurrenceObservations.occurrence.field.get_attname()
    })
    cur = connection.cursor()
    cur.execute(sql)


class ForestFragment(models.Model):
    """
    Represent a forest fragment zone.
    """
    uuid = models.CharField(max_length=36)
    geom = models.MultiPolygonField(srid=4326)

    objects = models.GeoManager()


# ===================#
# Association models #
# ===================#

class PlotOccurrences(models.Model):
    """
    Association model between plots and occurrences. This model enforce a
    one-to-many relationship between Plot and Occurrence models.
    """

    occurrence = models.ForeignKey(Occurrence, db_index=True)
    plot = models.ForeignKey(Plot, db_index=True)
    identifier = models.CharField(
        max_length=20,
        null=True, blank=True,
        db_index=True
    )

    class Meta:
        unique_together = (("occurrence", "plot"))
