# coding: utf-8

from django import forms
from django.forms.widgets import TextInput
from django.forms.extras.widgets import SelectDateWidget

import account.forms


class SignupForm(account.forms.SignupForm):
    """
    Override default signup form from account app.
    """

    first_name = forms.CharField(label="Prénom")
    last_name = forms.CharField(label="Nom")
