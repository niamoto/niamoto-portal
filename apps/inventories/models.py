# coding: utf-8

from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.core.validators import MinValueValidator
from django.db import transaction

from multiselectfield.db.fields import MultiSelectField
from apps.niamoto_data.models import Occurrence, OccurrenceObservations
from apps.niamoto_data.elevation_tools import set_occurrences_elevation
from apps.inventories.models_verbose_names import VERBOSE_NAMES as V


BOOLEAN_CHOICES = ((True, 'Oui'), (False, 'Non'))


class Inventory(models.Model):
    """
    Model representing an abstract natural inventory. Done someday, by someone,
    somewhere.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
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

    def is_taxa_inventory(self):
        return hasattr(self, 'taxainventory')

    def is_rapid_inventory(self):
        return hasattr(self, 'rapidinventory')


class TaxaInventoryManager(models.Manager):
    """
    Object manager for TaxaInventory model.
    """
    @transaction.atomic
    def create_taxa_inventory(self, inventory_date, observer, location,
                              location_description, comments, taxa):
        taxa_inventory = self.create(
            inventory_date=inventory_date,
            observer=observer,
            location=location,
            location_description=location_description,
            comments=comments,
        )
        elevation_to_set = []
        for taxon in taxa:
            occ = TaxaInventoryOccurrence.objects.create(
                date=inventory_date,
                taxon_id=taxon['id'],
                location=location,
                taxa_inventory=taxa_inventory,
            )
            OccurrenceObservations.objects.create(
                occurrence_id=occ.id,
                status="Vivant",
                last_observation_date=inventory_date,
            )
            elevation_to_set.append(occ.id)
        set_occurrences_elevation(elevation_to_set)
        return taxa_inventory


class TaxaInventory(Inventory):
    """
    Represents a inventory of taxa seen at a location.
    """

    comments = models.TextField(
        verbose_name="Commentaires",
        blank=True,
        null=True,
    )

    objects = TaxaInventoryManager()

    @transaction.atomic
    def update_occurrences(self, taxa):
        occurrences = self.occurrences.all()
        current_taxa = {o.taxon.id: o for o in occurrences}
        new_taxa = {t['id']: True for t in taxa}
        to_add = []
        to_delete = []
        elevation_to_set = []
        for t in taxa:
            if t['id'] not in current_taxa and t['id'] not in to_add:
                to_add.append(t['id'])
            if t['id'] in current_taxa:
                elevation_to_set.append(current_taxa[t['id']].id)
                current_taxa[t['id']].location = self.location
                current_taxa[t['id']].save()
        for key, value in current_taxa.items():
            if key not in new_taxa and value.id not in to_delete:
                to_delete.append(value.id)
        for o in to_delete:
            TaxaInventoryOccurrence.objects.get(pk=o).delete()
        for t in to_add:
            occ = TaxaInventoryOccurrence.objects.create(
                date=self.inventory_date,
                taxon_id=t,
                location=self.location,
                taxa_inventory_id=self.id
            )
            OccurrenceObservations.objects.create(
                occurrence_id=occ.id,
                status="Vivant",
                last_observation_date=self.inventory_date,
            )
            elevation_to_set.append(occ.id)
        set_occurrences_elevation(elevation_to_set)


class TaxaInventoryOccurrence(Occurrence):
    """
    Occurrence created using the taxa inventory app.
    """
    taxa_inventory = models.ForeignKey(
        TaxaInventory,
        related_name='occurrences'
    )

    @property
    def observer(self):
        return self.taxa_inventory.observer


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
