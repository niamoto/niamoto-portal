from .base import *

DATABASES = {
    'default': {
        'ENGINE':   'django.contrib.gis.db.backends.postgis',
        'OPTIONS': {
            'options': '-c search_path=niamoto_portal'
        },
        'NAME':     'amapiac',
        'USER':     'amapiac',
        'PASSWORD': 'amapiac',
        'HOST':     'niamoto.ird.nc',
        'PORT':     '',
    }
}
