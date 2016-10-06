# coding: utf-8

from django.conf.urls import url

from apps.user_occurrences.views import UserOccurrencesView


urlpatterns = [
    url(r'^$', UserOccurrencesView.as_view(), name="add_user_occurrences"),
]
