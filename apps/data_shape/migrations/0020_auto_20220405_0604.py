# Generated by Django 2.2.26 on 2022-04-05 06:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('data_shape', '0019_auto_20201117_0025'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='frequency',
            options={'ordering': ['class_object', 'class_index']},
        ),
    ]
