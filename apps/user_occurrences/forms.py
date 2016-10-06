# coding: utf-8

from django import forms


class UserOccurrencesForm(forms.Form):
    observation_date = forms.DateField(
        widget=forms.DateInput(attrs={'class': 'form_date'}),
        label="Date d'observation"
    )
    taxa = forms.CharField(
        label="Taxons observés"
    )
