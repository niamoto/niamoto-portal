# Generated by Django 2.2.7 on 2019-12-06 04:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('data_shape', '0003_auto_20191120_0004'),
    ]

    operations = [
        migrations.RenameField(
            model_name='shape',
            old_name='typeShape',
            new_name='type_shape',
        ),
    ]
