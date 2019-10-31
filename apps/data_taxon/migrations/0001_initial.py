# Generated by Django 2.2.6 on 2019-10-31 05:09

from django.db import migrations, models
import django.db.models.deletion
import mptt.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Graph',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(max_length=30)),
                ('title', models.CharField(max_length=30)),
                ('model', models.CharField(max_length=30)),
                ('sort', models.IntegerField()),
                ('height', models.CharField(choices=[('sm', 'Small'), ('md', 'Medium'), ('lg', 'Large')], default='md', max_length=2)),
                ('show', models.BooleanField(default=True)),
                ('profil', models.CharField(default='default', max_length=30)),
            ],
        ),
        migrations.CreateModel(
            name='Taxon',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=300)),
                ('rank_name', models.CharField(max_length=300)),
                ('id_endemia', models.IntegerField()),
                ('id_rang', models.IntegerField()),
                ('occ_count', models.IntegerField()),
                ('plot_count', models.IntegerField()),
                ('lft', models.PositiveIntegerField(editable=False)),
                ('rght', models.PositiveIntegerField(editable=False)),
                ('tree_id', models.PositiveIntegerField(db_index=True, editable=False)),
                ('level', models.PositiveIntegerField(editable=False)),
                ('parent', mptt.fields.TreeForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='data_taxon.Taxon')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Frequency',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('class_object', models.CharField(max_length=30)),
                ('class_name', models.CharField(max_length=30)),
                ('class_value', models.FloatField()),
                ('param1_str', models.CharField(blank=True, max_length=30, null=True)),
                ('param2_str', models.CharField(blank=True, max_length=30, null=True)),
                ('param3_float', models.FloatField(blank=True, null=True)),
                ('param4_float', models.FloatField(blank=True, null=True)),
                ('taxon', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='frequencies', to='data_taxon.Taxon')),
            ],
        ),
    ]
