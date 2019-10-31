# Generated by Django 2.2.6 on 2019-10-24 21:49

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('data_plot', '0004_auto_20191022_0219'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='frequency',
            name='id_plot',
        ),
        migrations.AddField(
            model_name='frequency',
            name='plot',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.DO_NOTHING, to='data_plot.Plot'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='graph',
            name='height',
            field=models.CharField(choices=[('sm', 'Small'), ('md', 'Medium'), ('lg', 'Large')], default='md', max_length=2),
        ),
    ]