# coding: utf-8

import os

from django.contrib.gis.db import models
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.contrib.auth.models import User

from apps.niamoto_data.models import Massif
from apps.forest_digitizing import db_routines


class OverwriteStorage(FileSystemStorage):

    def get_available_name(self, name):
        """
        Returns a filename that's free on the target storage system, and
        available for new content to be written to.
        """
        if self.exists(name):
            os.remove(os.path.join(settings.MEDIA_ROOT, name))
        return name


class MassifAssignation(models.Model):
    """
    Massif forests digitizing assignation.
    """

    NOT_DIGITIZED = 0
    BEING_DIGITIZED = 1
    DIGITIZED = 2
    STATUS_CHOICES = (
        (NOT_DIGITIZED, 'Non digitalisé'),
        (BEING_DIGITIZED, 'En cours'),
        (DIGITIZED, 'A valider'),
    )

    massif = models.OneToOneField(Massif, related_name='assignation',
                                  primary_key=True)
    operator = models.ForeignKey(User, null=True)
    status = models.IntegerField(default=0, choices=STATUS_CHOICES)
    spatialite_file = models.FileField(upload_to='spatialite_files',
                                       storage=OverwriteStorage(),
                                       null=True, blank=True)

    @property
    def massif_name(self):
        return self.massif.full_name

    def save(self, *args, **kwargs):
        """
        Overloading of model's save method to fill the postgis database
        after a spatialite had been uploaded.
        """
        super(MassifAssignation, self).save(*args, **kwargs)
        if hasattr(self, "spatialite_file"):
            return
        db_url = self.spatialite_file.url
        db_path = os.path.join(settings.BASE_DIR, db_url)
        print(db_path)
        # Get the data from the spatialite
        f_table = ForestFragment3k._meta.db_table
        db_routines.update_forest3k_from_spatialite(db_path, self.massif,
                                                    f_table)
        p_table = DigitizingProblem._meta.db_table
        db_routines.update_digitizing_problems_from_spatialite(db_path,
                                                               self.massif,
                                                               p_table)


class ForestFragment3k(models.Model):
    """
    Represent a 3k digitized forest fragment, bound to a massif.
    """

    uuid = models.CharField(max_length=36)
    massif = models.ForeignKey(Massif)
    created = models.DateTimeField(null=True)
    created_by = models.ForeignKey(User, null=True,
                                   related_name='created_fragments3k')
    modified = models.DateTimeField(null=True)
    modified_by = models.ForeignKey(User, null=True,
                                    related_name='modified_fragments3k')
    comments = models.TextField(null=True)
    geom = models.MultiPolygonField(srid=4326)

    def __str__(self):
        return "Forest fragment 3k - {}/{}".format(self.massif.name,
                                                   self.uuid)


class ForestFragment30k(models.Model):
    """
    Represent a 30k digitized forest fragment, bound to a massif.
    """

    uuid = models.CharField(max_length=36)
    massif = models.ForeignKey(Massif)
    created = models.DateTimeField(null=True)
    modified = models.DateTimeField(null=True)
    comments = models.TextField(null=True)
    geom = models.MultiPolygonField(srid=4326)

    def __str__(self):
        return "Forest fragment 30k - {}/{}".format(self.massif.name,
                                                    self.uuid)


class DigitizingProblem(models.Model):
    """
    Digitizing problems.
    """

    uuid = models.CharField(max_length=36, null=True)
    massif = models.ForeignKey(Massif)
    location = models.PointField(srid=4326, blank=False, unique=True)
    created = models.DateTimeField(null=True)
    created_by = models.ForeignKey(User, related_name='created_problems')
    modified = models.DateTimeField(null=True)
    modified_by = models.ForeignKey(User, null=True,
                                    related_name='modified_problems')
    problem = models.CharField(max_length=255, null=True)
    comments = models.TextField(null=True)

    @property
    def creator_username(self):
        return self.created_by.username

    @property
    def creator_full_name(self):
        return self.created_by.get_full_name()

    def __str__(self):
        return "Problem - {} - {} - {}".format(self.massif.full_name,
                                               self.created_by.get_full_name(),
                                               self.location)
