from .base import *

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

]
# Enable GZip.
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

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
