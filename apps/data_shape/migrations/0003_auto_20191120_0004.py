# Generated by Django 2.2.7 on 2019-11-20 00:04

import django.contrib.gis.db.models.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('data_shape', '0002_auto_20191119_2354'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shape',
            name='location',
            field=django.contrib.gis.db.models.fields.MultiPolygonField(blank=True, null=True, srid=4326),
        ),
    ]
