# coding: utf-8

from django.views.generic.edit import FormView

from apps.user_occurrences.forms import UserOccurrencesForm


class UserOccurrencesView(FormView):
    template_name = "user_occurrences/add_occurrences.html"
    form_class = UserOccurrencesForm

    def form_valid(self, form):
        pass

    def form_invalid(self, form):
        pass
