# coding: utf-8

from .rapid_inventories import (
    RapidInventoryViewSet,
    rapid_inventories_index,
    add_rapid_inventory,
    consult_rapid_inventory,
    delete_rapid_inventory
)

from .taxa_inventories import (
    TaxaInventoryViewSet,
    taxa_inventories_index,
    TaxaInventoryFormView,
    TaxaInventoryUpdateView,
    TaxaInventoryDeleteView,
)
