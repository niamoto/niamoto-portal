# coding: utf-8

from django.conf.urls import url

from web.views import home


urlpatterns = [
    url(r"^$", home, name="home"),
]
