# Generated by Django 2.2.6 on 2019-11-12 00:47

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('data_taxon', '0003_phenology'),
    ]

    operations = [
        migrations.AlterField(
            model_name='phenology',
            name='taxon',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='phenology', to='data_taxon.Taxon'),
        ),
    ]