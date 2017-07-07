# coding: utf-8

from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView


@method_decorator(login_required, name='dispatch')
class DataMartView(TemplateView):
    """
    Class-based view for plot dashboards page.
    """
    template_name = "data_marts/data_mart.html"
