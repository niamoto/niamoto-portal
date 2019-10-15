import os
from .base import *
import django_heroku
import dj_database_url

GDAL_LIBRARY_PATH = os.environ.get('GDAL_LIBRARY_PATH')
GEOS_LIBRARY_PATH = os.environ.get('GEOS_LIBRARY_PATH')
# Activate Django-Heroku.
django_heroku.settings(locals())
