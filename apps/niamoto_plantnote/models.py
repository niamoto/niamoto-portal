# coding: utf-8

import os
import uuid

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db import models


class OverwriteStorage(FileSystemStorage):
    def get_available_name(self, name, max_length=None):
        if self.exists(name):
            os.remove(os.path.join(settings.MEDIA_ROOT, name))
        return name


def plantnote_database_path(instance, filename):
    return "niamoto_plantnote/databases/{0}/{0}.sqlite".format(instance.uuid)


class PlantnoteDatabase(models.Model):
    """
    Model representing the upload of a plantnote database.
    """

    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=False)
    last_activated_at = models.DateTimeField(null=True, blank=True)
    file = models.FileField(
        upload_to=plantnote_database_path,
        storage=OverwriteStorage(),
        max_length=500
    )

    @classmethod
    def active_database(cls):
        return cls.objects.get(active=True)
