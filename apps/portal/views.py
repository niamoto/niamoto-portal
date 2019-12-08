from django.shortcuts import render

# Create your views here.


def home(request):
    return render(request, 'home.html', {})


def methodologie(request):
    return render(request, 'methodologie.html', {})
