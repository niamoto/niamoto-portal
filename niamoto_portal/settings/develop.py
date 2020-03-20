from .base import *
import sys

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
        'HOST':     '127.0.0.1',
        'PORT':     '',
    }
}

if 'test' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE':   'django.contrib.gis.db.backends.postgis',
            'OPTIONS': {
                # with public, the postgis extension is available on the niamoto
                'options': '-c search_path=niamoto_portal,public'
            },
            'NAME':     'niamoto',
            'USER':     'niamoto',
            'PASSWORD': 'niamoto',
            'HOST':     '127.0.0.1',
            'PORT':     '',
        }
    }
