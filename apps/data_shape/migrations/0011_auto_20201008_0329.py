# Generated by Django 2.2.12 on 2020-10-08 03:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('data_shape', '0010_frequency_class_index'),
    ]

    operations = [
        migrations.RenameField(
            model_name='shape',
            old_name='forest_heart',
            new_name='forest_core',
        ),
    ]
