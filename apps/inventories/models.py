# coding: utf-8

from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.core.validators import MinValueValidator
from multiselectfield.db.fields import MultiSelectField

from apps.inventories.models_verbose_names import VERBOSE_NAMES as V


BOOLEAN_CHOICES = ((True, 'Oui'), (False, 'Non'))


class Inventory(models.Model):
    """
    Model representing an abstract natural inventory. Done someday, by someone,
    somewhere.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    inventory_date = models.DateField(verbose_name=V['inventory_date'])
    observer = models.ForeignKey(User, verbose_name=V['observer'])
    location = models.PointField(srid=4326, verbose_name=V['location'])
    location_description = models.TextField(
        verbose_name=V['location_description'],
        blank=True,
        null=True
    )

    @property
    def observer_full_name(self):
        return self.observer.get_full_name()


class TaxaInventory(Inventory):
    """
    Represents a inventory of taxa seen at a location.
    """


class RapidInventory(Inventory):
    """
    Model representing the data of a forest rapid inventory.
    """

    # "Prise de mesure en statique au centre de la placette"
    topography = models.IntegerField(
        choices=(
            (0, "Fond de vallée"), (1, "Bas de pente"),
            (2, "Milieu de pente"), (3, "Haut de pente"), (4, "Crête"),
            (5, "Plateau"), (6, "Cuvette"),
        ),
        verbose_name=V['topography'],
        blank=False,
    )
    diameters_diff_or_same = models.IntegerField(
        choices=(
            (0, "Environ tous les mêmes diamètres"),
            (1, "Des diamètres différents"),
        ),
        verbose_name=V['diameters_diff_or_same'],
        blank=False,
        default=-1,
    )
    little_diam_nb = models.IntegerField(
        choices=(
            (0, "0"), (1, "<= 3"), (2, "> 3"),
        ),
        verbose_name=V['little_diam_nb'],
        blank=False,
        default=-1,
    )
    big_diam_nb = models.IntegerField(
        choices=(
            (0, "0"), (1, "<= 3"), (2, "> 3"),
        ),
        verbose_name=V['big_diam_nb'],
        blank=False,
        default=-1,
    )
    biggest_tree_in_hands = models.FloatField(
        verbose_name=V['biggest_tree_in_hands'],
        validators=[MinValueValidator(0), ],
    )
    canopy_density = models.IntegerField(
        choices=(
            (0, "Couvert fermé, dense"), (1, "Couvert Inégal"),
            (2, "Couvert clair, ouvert"),
        ),
        verbose_name=V['canopy_density'],
        blank=False,
        default=-1,
    )
    regeneration_appearance = models.IntegerField(
        choices=(
            (0, "Dense"), (1, "Clairsemée"), (2, "Inexistante"),
        ),
        verbose_name=V['regeneration_appearance'],
        blank=False,
        default=-1,
    )
    regen_diff_leaves = models.IntegerField(
        verbose_name=V['regen_diff_leaves']
    )
    # "Prise de mesure en cheminement dans la placette"
    pres_palm_tree = MultiSelectField(
        choices=(
            (0, "En sous-bois"), (1, "En canopée"),
            (2, "Isolés"), (3, "Regroupements")
        ),
        verbose_name=V['pres_palm_tree'],
        max_length=30,
        null=True,
        blank=True,
        default="",
    )
    presence_liana = MultiSelectField(
        choices=(
            (0, "Isolées"), (1, "Regroupements"), (2, "Infranchissables"),
        ),
        verbose_name=V['presence_liana'],
        max_length=30,
        null=True,
        blank=True,
        default="",
    )
    presence_arb_fern = MultiSelectField(
        choices=(
            (0, "En sous-bois"), (1, "En canopée"),
            (2, "Isolées"), (3, "Regroupements"),
        ),
        verbose_name=V['presence_arb_fern'],
        max_length=30,
        null=True,
        blank=True,
        default="",
    )
    presence_other_fern = MultiSelectField(
        choices=(
            (0, "En sous-bois"), (1, "En canopée"),
            (2, "Isolées"), (3, "Regroupements"),
        ),
        verbose_name=V['presence_other_fern'],
        max_length=30,
        null=True,
        blank=True,
        default="",
    )
    presence_niaouli = MultiSelectField(
        choices=(
            (0, "En sous-bois"), (1, "En canopée"),
            (2, "Isolés"), (3, "Regroupements"),
        ),
        verbose_name=V['presence_niaouli'],
        max_length=30,
        null=True,
        blank=True,
        default="",
    )
    presence_tamanou = MultiSelectField(
        choices=(
            (0, "En sous-bois"), (1, "En canopée"),
            (2, "Isolés"), (3, "Regroupements"),
        ),
        verbose_name=V['presence_tamanou'],
        max_length=30,
        null=True,
        blank=True,
        default="",
    )
    presence_kaori = MultiSelectField(
        choices=(
            (0, "En sous-bois"), (1, "En canopée"),
            (2, "Isolés"), (3, "Regroupements"),
        ),
        verbose_name=V['presence_kaori'],
        max_length=30,
        null=True,
        blank=True,
        default="",
    )
    presence_columnaris_pine = MultiSelectField(
        choices=(
            (0, "En sous-bois"), (1, "En canopée"),
            (2, "Isolés"), (3, "Regroupements"),
        ),
        verbose_name=V['presence_columnaris_pine'],
        max_length=30,
        null=True,
        blank=True,
        default="",
    )
    presence_pandanus = MultiSelectField(
        choices=(
            (0, "En sous-bois"), (1, "En canopée"),
            (2, "Isolés"), (3, "Regroupements"),
        ),
        verbose_name=V['presence_pandanus'],
        max_length=30,
        null=True,
        blank=True,
        default="",
    )
    presence_banian = MultiSelectField(
        choices=(
            (0, "En sous-bois"), (1, "En canopée"),
            (2, "Isolés"), (3, "Regroupements"),
        ),
        verbose_name=V['presence_banian'],
        max_length=30,
        null=True,
        blank=True,
        default="",
    )
    presence_houp = MultiSelectField(
        choices=(
            (0, "En sous-bois"), (1, "En canopée"),
            (2, "Isolés"), (3, "Regroupements"),
        ),
        verbose_name=V['presence_houp'],
        max_length=30,
        null=True,
        blank=True,
        default="",
    )
    dominating_specie = models.IntegerField(
        choices=(
            (0, "Non"), (1, "Je ne sais pas"), (2, "Oui"),
        ),
        verbose_name=V['dominating_specie'],
        blank=False,
        default=-1,
    )
    flowers = models.IntegerField(
        verbose_name=V['flowers'],
        choices=(
            (0, "Non"), (1, "Oui"),
        ),
        blank=False,
        default=-1,
    )
    dead_trees_on_ground = models.IntegerField(
        verbose_name=V['dead_trees_on_ground']
    )
    dead_trees_on_root = models.IntegerField(
        verbose_name=V['dead_trees_on_root'],
        choices=(
            (0, "Non"), (1, "Oui"),
        ),
        blank=False,
        default=-1,
    )
    fire_marks = models.IntegerField(
        verbose_name=V['fire_marks'],
        choices=(
            (0, "Non"), (1, "Oui"),
        ),
        blank=False,
        default=-1,
    )
    lumberjack_marks = models.IntegerField(
        verbose_name=V['lumberjack_marks'],
        choices=(
            (0, "Non"), (1, "Oui"),
        ),
        blank=False,
        default=-1,
    )
    machete_marks = models.IntegerField(
        verbose_name=V['machete_marks'],
        choices=(
            (0, "Non"), (1, "Oui"),
        ),
        blank=False,
        default=-1,
    )
    invasive_species = models.IntegerField(
        choices=(
            (0, "Non"), (1, "Je ne sais pas"), (2, "Oui"),
        ),
        verbose_name=V['invasive_species'],
        blank=False,
        default=-1,
    )
    stag_marks = models.IntegerField(
        choices=(
            (0, "Non"), (1, "Oui"),
        ),
        verbose_name=V['stag_marks'],
        blank=False,
        default=-1,
    )
    pig_marks = models.IntegerField(
        choices=(
            (0, "Non"), (1, "Oui"),
        ),
        verbose_name=V['pig_marks'],
        blank=False,
        default=-1,
    )
    electric_ant_marks = models.IntegerField(
        choices=(
            (0, "Non"), (1, "Oui"),
        ),
        verbose_name=V['electric_ant_marks'],
        blank=False,
        default=-1,
    )
    other_observations = models.TextField(
        verbose_name=V['other_observations'],
        blank=True,
        null=True,
    )

    @property
    def observer_full_name(self):
        return self.observer.get_full_name()
