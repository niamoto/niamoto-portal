# -*- coding: utf-8 -*-
# Generated by Django 1.9.11 on 2017-06-26 21:06
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('niamoto_data', '0020_auto_20170627_0803'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='occurrence',
            name='last_observation_date',
        ),
    ]
