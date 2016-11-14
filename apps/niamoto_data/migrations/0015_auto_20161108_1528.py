# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-11-08 04:28
from __future__ import unicode_literals

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('niamoto_data', '0014_auto_20161004_1732'),
    ]

    operations = [
        migrations.AddField(
            model_name='occurrence',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=datetime.datetime(2016, 11, 8, 4, 28, 33, 625704, tzinfo=utc)),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='occurrence',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
    ]