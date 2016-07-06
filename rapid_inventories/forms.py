# coding: utf-8

from django.db.models import BooleanField
from django.forms import ModelForm, TextInput, DateInput,\
    RadioSelect
from crispy_forms.bootstrap import InlineRadios, InlineCheckboxes
from crispy_forms.helper import FormHelper
from django.forms.widgets import NumberInput

from rapid_inventories.models import RapidInventory


class RapidInventoryForm(ModelForm):

    class Meta:
        model = RapidInventory
        exclude = ['observer', 'location']

    def __init__(self, *args, **kwargs):
        read_only = False
        if 'read_only' in kwargs:
            read_only = kwargs.pop('read_only')
        super(RapidInventoryForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_tag = False
        for field in self.fields:
            if isinstance(RapidInventory._meta.get_field(field), BooleanField):
                self.fields[field].widget = RadioSelect()
        if read_only:
            # Read only form - Code from django snippets:
            # "https://djangosnippets.org/snippets/3040/"#
            from django.utils.translation import ugettext as _
            from django.forms.widgets import Select
            super(RapidInventoryForm, self).__init__(*args, **kwargs)
            for f in self.fields:
                self.fields[f].label = _(self.fields[f].label)
                if isinstance(self.fields[f].widget, Select):
                    self.fields[f].widget.attrs['disabled'] = 'disabled'
                else:
                    self.fields[f].widget.attrs['readonly'] = 'readonly'


class GeneralInformationsForm(RapidInventoryForm):
    class Meta:
        model = RapidInventory
        fields = ['inventory_date', 'location_description', 'topography', ]
        widgets = {
            'inventory_date': DateInput(attrs={'class': 'form_date'}),
            'location_description': TextInput(),
        }


class MeasuresFromCenterForm(RapidInventoryForm):
    class Meta:
        model = RapidInventory
        fields = ['diameters_diff_or_same', 'little_diam_nb',
                  'big_diam_nb', 'biggest_tree_in_hands', 'canopy_density',
                  'regeneration_appearance', 'regen_diff_leaves']
        widgets = {
            'biggest_tree_in_hands': NumberInput(attrs={'min': '0', }),
            'regen_diff_leaves': NumberInput(attrs={'min': '0', }),
        }

    def __init__(self, *args, **kwargs):
        super(MeasuresFromCenterForm, self).__init__(*args, **kwargs)
        for i in (0, 1, 2, 4, 5):
            self.helper[i] = InlineRadios(
                self.Meta.fields[i],
            )


class VegetationDescriptionForm(RapidInventoryForm):
    class Meta:
        model = RapidInventory
        fields = ['pres_palm_tree', 'presence_liana', 'presence_arb_fern',
                  'presence_other_fern', 'presence_niaouli', 'presence_tamanou',
                  'presence_kaori', 'presence_columnaris_pine',
                  'presence_pandanus', 'presence_banian', 'presence_houp', ]

    def __init__(self, *args, **kwargs):
        super(VegetationDescriptionForm, self).__init__(*args, **kwargs)
        for i in range(len(self.Meta.fields)):
            self.helper[i] = InlineCheckboxes(
                self.Meta.fields[i],
                attrs={'class': 'checkbox-inline'}
            )


class MeasuresWalkingForm(RapidInventoryForm):
    class Meta:
        model = RapidInventory
        fields = ['dominating_specie', 'flowers',
                  'dead_trees_on_ground', 'dead_trees_on_root', 'fire_marks',
                  'lumberjack_marks', 'machete_marks', 'invasive_species',
                  'stag_marks', 'pig_marks', 'electric_ant_marks',
                  'other_observations']
        widgets = {
            'dead_trees_on_ground': NumberInput(attrs={'min': '0', }),
        }

    def __init__(self, *args, **kwargs):
        super(MeasuresWalkingForm, self).__init__(*args, **kwargs)
        for i in (0, 1, 3, 4, 5, 6, 7, 8, 9, 10):
            self.helper[i] = InlineRadios(self.Meta.fields[i])
