# Generated by Django 2.2.12 on 2020-11-25 03:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0022_siteinfo'),
    ]

    operations = [
        migrations.AddField(
            model_name='ressource',
            name='category',
            field=models.CharField(default='divers', max_length=50),
        ),
    ]
