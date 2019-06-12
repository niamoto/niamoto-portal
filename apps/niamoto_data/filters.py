# coding: utf-8

import django_filters


class PlotFilter(django_filters.rest_framework.FilterSet):
    """
    Custom filter set for Plot rest service.
    """
    name = django_filters.CharFilter()
