# coding: utf-8

from django.forms import TextInput, DateInput

from .inventories import InventoryForm
from apps.inventories.models import TaxaInventory


class TaxaInventoryForm(InventoryForm):
    """
    Form for taxa inventory model.
    """
    class Meta:
        model = TaxaInventory
        exclude = ['observer', 'location']
        widgets = {
            'inventory_date': DateInput(attrs={'class': 'form_date'}),
            'location_description': TextInput(),
        }
