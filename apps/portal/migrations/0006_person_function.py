# Generated by Django 2.2.12 on 2020-05-04 23:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portal', '0005_person_permanent'),
    ]

    operations = [
        migrations.AddField(
            model_name='person',
            name='function',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
