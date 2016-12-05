# coding: utf-8

from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse
from django.shortcuts import render
import account.views

from apps.inventories.models import RapidInventory, TaxaInventory
from web.forms import SignupForm


LAST_RECORDS_LIMIT = 5


def home(request):
    if request.user.is_authenticated():
        last_rapid_inventories = RapidInventory.objects.all() \
            .order_by('created_at').reverse()[:LAST_RECORDS_LIMIT]
        last_taxa_inventories = TaxaInventory.objects.all() \
            .order_by('created_at').reverse()[:LAST_RECORDS_LIMIT]
        taxa_url = reverse('inventory-api:taxa_inventory-list')
        rapid_url = reverse('inventory-api:rapid_inventory-list')
        return render(request, 'homepage.html', {
            'last_rapid_inventories': last_rapid_inventories,
            'last_taxa_inventories': last_taxa_inventories,
            'rapid_inventories_count': RapidInventory.objects.count(),
            'taxa_inventories_count': TaxaInventory.objects.count(),
            'rapid_inventories_url': "{}?limit={}&ordering={}".format(
                rapid_url, LAST_RECORDS_LIMIT, "-created_at"
            ),
            'taxa_inventories_url': "{}?limit={}&ordering={}".format(
                taxa_url, LAST_RECORDS_LIMIT, "-created_at"
            ),
        })
    else:
        return render(request, 'splash_page.html', {})


class SignupView(account.views.SignupView):
    """
    Class-based view for signup, overriding the one from account app.
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
