# -*- coding: utf-8 -*-
# Generated by Django 1.9.11 on 2017-06-26 21:38
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('niamoto_data', '0022_auto_20170627_0821'),
        ('inventories', '0010_auto_20161109_1315'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='taxainventoryoccurrence',
            name='occurrence_ptr',
        ),
        migrations.RemoveField(
            model_name='taxainventoryoccurrence',
            name='taxa_inventory',
        ),
        migrations.DeleteModel(
            name='TaxaInventoryOccurrence',
        ),
    ]