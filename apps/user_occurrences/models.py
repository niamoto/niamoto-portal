# coding: utf-8

from django.db import models

from apps.niamoto_data.models import Occurrence
from apps.inventories.models import TaxaInventory


class UserOccurrence(Occurrence):
    """
    Occurrence observed by a niamoto user.
    """
    taxa_inventory = models.ForeignKey(TaxaInventory)
    input_date = models.DateTimeField()

    @property
    def observer(self):
        return self.taxa_inventory.observer
