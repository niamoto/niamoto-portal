# Generated by Django 2.2.12 on 2020-04-20 04:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_shape', '0003_auto_20200420_0402'),
    ]

    operations = [
        migrations.AlterField(
            model_name='graph',
            name='legend_locate',
            field=models.CharField(choices=[('left', 'left'), ('bottom', 'bottom')], default='bottom', max_length=10),
        ),
    ]
