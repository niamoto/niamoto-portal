from django.shortcuts import render
from django.views.generic import TemplateView
from django.http import HttpResponse
from django.template import loader
from .models import Ressource, Person, Activity, Tree, Faq, SiteInfo
import random
# Create your views here.


class HomeView(TemplateView):
    template_name = "home.html"
    def get_context_data(self, **kwargs):
        siteInfos = SiteInfo.objects.all()
        return {
            'siteinfos': siteInfos
        }


def maintenance(request):
    return render(request, 'maintenance.html', {})


# def ressources(request):
#     return render(request, 'ressources.html', {})


class RessouresView(TemplateView):

    template_name = 'ressources.html'

    def get_context_data(self, **kwargs):
        ressources = Ressource.objects.all().order_by('-year')
        persons = Person.objects.all().order_by('?')
        activities = Activity.objects.all
        trees = Tree.objects.all().order_by(
            'family_name', 'genus_name', 'name')
        siteInfos = SiteInfo.objects.all()
        return {
            'ressources': ressources,
            'persons': persons,
            'activities': activities,
            'trees': trees,
            'siteinfos': siteInfos
        }

class MethologyView(TemplateView):
    template_name= 'methodologie.html'

    def get_context_data(self, **kwargs):
        faqs = Faq.objects.all().order_by('id')
        siteInfos = SiteInfo.objects.all()
        return {
            'faqs': faqs,
            'siteinfos': siteInfos
        }
    
