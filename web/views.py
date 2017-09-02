# coding: utf-8

import json

from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse
from django.shortcuts import render
import account.views
from niamoto.api import status_api

from apps.inventories.models import RapidInventory, TaxaInventory, Inventory
from web.forms import SignupForm, SettingsForm


LAST_RECORDS_LIMIT = 5


def home(request):
    if request.user.is_authenticated():
        last_rapid_inventories = RapidInventory.objects.all() \
            .order_by('created_at').reverse()[:LAST_RECORDS_LIMIT]
        last_taxa_inventories = TaxaInventory.objects.all() \
            .order_by('created_at').reverse()[:LAST_RECORDS_LIMIT]
        taxa_url = reverse('inventory-api:taxa_inventory-list')
        rapid_url = reverse('inventory-api:rapid_inventory-list')
        taxa_invs = list(last_taxa_inventories)
        rapid_invs = list(last_rapid_inventories)
        sorted_invs = sorted(
            taxa_invs + rapid_invs,
            key=lambda inv: inv.created_at,
            reverse=True
        )
        for inv in sorted_invs:
            if isinstance(inv, RapidInventory):
                inv.type_key = "Inventaire rapide"
            elif isinstance(inv, TaxaInventory):
                inv.type_key = "Inventaire taxonomique"
        status = {k: int(v) for k, v in status_api.get_general_status().items()}
        return render(request, 'homepage.html', {
            'last_inventories': sorted_invs,
            'rapid_inventories_count': RapidInventory.objects.count(),
            'taxa_inventories_count': TaxaInventory.objects.count(),
            'user_count': get_user_model().objects.count(),
            'rapid_inventories_url': "{}?limit={}&ordering={}".format(
                rapid_url, LAST_RECORDS_LIMIT, "-created_at"
            ),
            'taxa_inventories_url': "{}?limit={}&ordering={}".format(
                taxa_url, LAST_RECORDS_LIMIT, "-created_at"
            ),
            'status': json.dumps(status),
        })
    else:
        return render(request, 'splash_page.html', {})


class SignupView(account.views.SignupView):
    """
    Class-based view for signup, extending the one from account app.
    """

    form_class = SignupForm

    def create_user(self, form, commit=True, model=None, **kwargs):
        """
        Overrride create_user method to include first and last names.
        """
        User = model
        if User is None:
            User = get_user_model()
        user = User(**kwargs)
        username = form.cleaned_data.get("username")
        if username is None:
            username = self.generate_username(form)
        user.username = username
        user.email = form.cleaned_data["email"].strip()
        password = form.cleaned_data.get("password")
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.first_name = form.cleaned_data.get('first_name')
        user.last_name = form.cleaned_data.get('last_name')
        if commit:
            user.save()
        return user


class SettingsView(account.views.SettingsView):
    """
    Class-based view for settings, extending the one from account app.
    """

    form_class = SettingsForm

    def get_initial(self):
        initial = super(SettingsView, self).get_initial()
        initial["first_name"] = self.request.user.first_name
        initial["last_name"] = self.request.user.last_name
        return initial

    def update_settings(self, form):
        super(SettingsView, self).update_settings(form)
        self.update_user(form)

    def update_user(self, form):
        fields = {}
        if "first_name" in form.cleaned_data:
            fields["first_name"] = form.cleaned_data["first_name"]
        if "last_name" in form.cleaned_data:
            fields["last_name"] = form.cleaned_data["last_name"]
        if fields:
            user = self.request.user
            for k, v in fields.items():
                setattr(user, k, v)
                user.save()

