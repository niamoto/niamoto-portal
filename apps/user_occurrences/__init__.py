# coding: utf-8

from django.db import models
from django.contrib.auth.models import User

from apps.niamoto_data.models import Occurrence


class UserOccurrence(Occurrence):
    """
    Occurrence observed by a niamoto user.
    """
    observer = models.ForeignKey(User)
    input_date = models.DateTimeField()
