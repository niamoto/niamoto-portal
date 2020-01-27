# Generated by Django 2.2.9 on 2020-01-06 03:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_plot', '0006_auto_20191024_2256'),
    ]

    operations = [
        migrations.AlterField(
            model_name='graph',
            name='height',
            field=models.CharField(choices=[('25', 'Small'), ('50', 'Medium'), ('75', 'Large'), ('100', 'XLarge')], default='25', max_length=2),
        ),
    ]