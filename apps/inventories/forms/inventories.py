# coding: utf-8

from django.db.models import BooleanField
from django.forms import ModelForm, RadioSelect
from crispy_forms.helper import FormHelper


class InventoryForm(ModelForm):
    """
    Abstract base class for inventory form.
    """
    def __init__(self, *args, **kwargs):
        read_only = False
        if 'read_only' in kwargs:
            read_only = kwargs.pop('read_only')
        ModelForm.__init__(self, *args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_tag = False
        for f in self.fields:
            if isinstance(self.Meta.model._meta.get_field(f), BooleanField):
                self.fields[f].widget = RadioSelect()
        if read_only:
            # Read only form - Code from django snippets:
            # "https://djangosnippets.org/snippets/3040/"#
            from django.utils.translation import ugettext as _
            from django.forms.widgets import Select
            for f in self.fields:
                self.fields[f].label = _(self.fields[f].label)
                if isinstance(self.fields[f].widget, Select):
                    self.fields[f].widget.attrs['disabled'] = 'disabled'
                else:
                    self.fields[f].widget.attrs['readonly'] = 'readonly'
