# -*- coding: utf-8 -*-
# Generated by Django 1.9.13 on 2018-02-02 11:40
from __future__ import unicode_literals

import django.contrib.gis.db.models.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('niamoto_data', '0023_auto_20171215_1506'),
    ]

    operations = [
        migrations.AlterField(
            model_name='massif',
            name='geom',
            field=django.contrib.gis.db.models.fields.MultiPolygonField(blank=True, null=True, srid=4326),
        ),
    ]
