# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-08-18 02:33
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('niamoto_data', '0009_auto_20160810_1203'),
    ]

    operations = [
        migrations.CreateModel(
            name='OccurrenceObservations',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_observation_date', models.DateField()),
                ('height', models.FloatField(blank=True, null=True)),
                ('stem_nb', models.IntegerField(blank=True, null=True)),
                ('circumference', models.FloatField(blank=True, null=True)),
                ('status', models.CharField(max_length=50)),
                ('wood_density', models.FloatField(blank=True, null=True)),
                ('bark_thickness', models.FloatField(blank=True, null=True)),
                ('occurrence', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='observations', to='niamoto_data.Occurrence')),
            ],
        ),
    ]
