# Generated by Django 2.2.12 on 2020-10-22 04:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('data_shape', '0015_remove_shape_r_in_median'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='shape',
            name='n_unique_species',
        ),
    ]
