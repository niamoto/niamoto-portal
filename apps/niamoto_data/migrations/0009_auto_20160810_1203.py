# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-08-10 01:03
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('niamoto_data', '0008_auto_20160810_1154'),
    ]

    operations = [
        migrations.AlterField(
            model_name='plotoccurrences',
            name='identifier',
            field=models.CharField(blank=True, db_index=True, max_length=20, null=True),
        ),
    ]
