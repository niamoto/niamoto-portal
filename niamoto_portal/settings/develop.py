from .base import *

DATABASES = {
    'default': {
        'ENGINE':   'django.contrib.gis.db.backends.postgis',
        'OPTIONS': {
            # with public, the postgis extension is available on the niamoto
            'options': '-c search_path=niamoto_portal,public'
        },
        'NAME':     'amapiac',
        'USER':     'amapiac',
        'PASSWORD': 'amapiac',
        'HOST':     'niamoto.ird.nc',
        'PORT':     '',
    }
}
