# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import multiselectfield.db.fields
import django.contrib.gis.db.models.fields
import django.core.validators
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='RapidInventory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, verbose_name='ID', serialize=False)),
                ('inventory_date', models.DateField(verbose_name="Date de l'inventaire")),
                ('location', django.contrib.gis.db.models.fields.PointField(srid=4326, verbose_name='Localisation')),
                ('location_description', models.TextField(blank=True, null=True, verbose_name='Localité (Commune, Tribu, Lieu dit, ...)')),
                ('topography', models.IntegerField(choices=[(0, 'Fond de vallée'), (1, 'Bas de pente'), (2, 'Milieu de pente'), (3, 'Haut de pente'), (4, 'Crête'), (5, 'Plateau'), (6, 'Cuvette')], verbose_name='Position topographique')),
                ('diameters_diff_or_same', models.IntegerField(default=-1, choices=[(0, 'Environ tous les mêmes diamètres'), (1, 'Des diamètres différents')], verbose_name="Diamètres: avez-vous l'impression que les arbres ont")),
                ('little_diam_nb', models.IntegerField(default=-1, choices=[(0, '0'), (1, '<= 3'), (2, '> 3')], verbose_name="Combien d'arbres de petit diamètre observez-vous? (<= 1 main ou 20cm)")),
                ('big_diam_nb', models.IntegerField(default=-1, choices=[(0, '0'), (1, '<= 3'), (2, '> 3')], verbose_name="Combien d'arbres de gros diamètre observez-vous? (> 3 mains ou 60cm)")),
                ('biggest_tree_in_hands', models.FloatField(verbose_name='Arbre le plus gros de la placette en nombre de mains', validators=[django.core.validators.MinValueValidator(0)])),
                ('canopy_density', models.IntegerField(default=-1, choices=[(0, 'Couvert fermé, dense'), (1, 'Couvert Inégal'), (2, 'Couvert clair, ouvert')], verbose_name='Qualifiez la densité du couvert de la canopée')),
                ('regeneration_appearance', models.IntegerField(default=-1, choices=[(0, 'Dense'), (1, 'Clairsemée'), (2, 'Inexistante')], verbose_name='La régénération vous semble t-elle')),
                ('regen_diff_leaves', models.IntegerField(verbose_name="Diversité de la régénération - Estimez le nombre d'espèces différentes parmi les individus constituant la régénération?")),
                ('pres_palm_tree', multiselectfield.db.fields.MultiSelectField(default='', null=True, blank=True, max_length=30, choices=[(0, 'En sous-bois'), (1, 'En canopée'), (2, 'Isolés'), (3, 'Regroupements')], verbose_name='Palmiers')),
                ('presence_liana', multiselectfield.db.fields.MultiSelectField(default='', null=True, blank=True, max_length=30, choices=[(0, 'Isolées'), (1, 'Regroupements'), (2, 'Infranchissables')], verbose_name='Lianes')),
                ('presence_arb_fern', multiselectfield.db.fields.MultiSelectField(default='', null=True, blank=True, max_length=30, choices=[(0, 'En sous-bois'), (1, 'En canopée'), (2, 'Isolées'), (3, 'Regroupements')], verbose_name='Fougères arborescentes')),
                ('presence_other_fern', multiselectfield.db.fields.MultiSelectField(default='', null=True, blank=True, max_length=30, choices=[(0, 'En sous-bois'), (1, 'En canopée'), (2, 'Isolées'), (3, 'Regroupements')], verbose_name='Autres fougères')),
                ('presence_niaouli', multiselectfield.db.fields.MultiSelectField(default='', null=True, blank=True, max_length=30, choices=[(0, 'En sous-bois'), (1, 'En canopée'), (2, 'Isolés'), (3, 'Regroupements')], verbose_name='Niaouli')),
                ('presence_tamanou', multiselectfield.db.fields.MultiSelectField(default='', null=True, blank=True, max_length=30, choices=[(0, 'En sous-bois'), (1, 'En canopée'), (2, 'Isolés'), (3, 'Regroupements')], verbose_name='Tamanou')),
                ('presence_kaori', multiselectfield.db.fields.MultiSelectField(default='', null=True, blank=True, max_length=30, choices=[(0, 'En sous-bois'), (1, 'En canopée'), (2, 'Isolés'), (3, 'Regroupements')], verbose_name='Kaori')),
                ('presence_columnaris_pine', multiselectfield.db.fields.MultiSelectField(default='', null=True, blank=True, max_length=30, choices=[(0, 'En sous-bois'), (1, 'En canopée'), (2, 'Isolés'), (3, 'Regroupements')], verbose_name='Pin colonnaire')),
                ('presence_pandanus', multiselectfield.db.fields.MultiSelectField(default='', null=True, blank=True, max_length=30, choices=[(0, 'En sous-bois'), (1, 'En canopée'), (2, 'Isolés'), (3, 'Regroupements')], verbose_name='Pandanus')),
                ('presence_banian', multiselectfield.db.fields.MultiSelectField(default='', null=True, blank=True, max_length=30, choices=[(0, 'En sous-bois'), (1, 'En canopée'), (2, 'Isolés'), (3, 'Regroupements')], verbose_name='Banian')),
                ('presence_houp', multiselectfield.db.fields.MultiSelectField(default='', null=True, blank=True, max_length=30, choices=[(0, 'En sous-bois'), (1, 'En canopée'), (2, 'Isolés'), (3, 'Regroupements')], verbose_name='Houp')),
                ('dominating_specie', models.IntegerField(default=-1, choices=[(0, 'Non'), (1, 'Je ne sais pas'), (2, 'Oui')], verbose_name='Une espèce vous semble t-elle dominante sur la placette?')),
                ('flowers', models.IntegerField(default=-1, choices=[(0, 'Non'), (1, 'Oui')], verbose_name='Observez-vous des arbres en fleur ou en fruit?')),
                ('dead_trees_on_ground', models.IntegerField(verbose_name="Nombre d'arbres morts au sol")),
                ('dead_trees_on_root', models.IntegerField(default=-1, choices=[(0, 'Non'), (1, 'Oui')], verbose_name='Voyez-vous des arbres morts sur pied')),
                ('fire_marks', models.IntegerField(default=-1, choices=[(0, 'Non'), (1, 'Oui')], verbose_name='Voyez-vous des traces de feu?')),
                ('lumberjack_marks', models.IntegerField(default=-1, choices=[(0, 'Non'), (1, 'Oui')], verbose_name='Voyez-vous des traces de bucheronnage?')),
                ('machete_marks', models.IntegerField(default=-1, choices=[(0, 'Non'), (1, 'Oui')], verbose_name='Voyez-vous des traces de sabres')),
                ('invasive_species', models.IntegerField(default=-1, choices=[(0, 'Non'), (1, 'Je ne sais pas'), (2, 'Oui')], verbose_name='Voyez-vous des espèces végétales exotique envahissantes?')),
                ('stag_marks', models.IntegerField(default=-1, choices=[(0, 'Non'), (1, 'Oui')], verbose_name='Voyez-vous des traces de cerf?')),
                ('pig_marks', models.IntegerField(default=-1, choices=[(0, 'Non'), (1, 'Oui')], verbose_name='Voyez-vous des traces de cochon?')),
                ('electric_ant_marks', models.IntegerField(default=-1, choices=[(0, 'Non'), (1, 'Oui')], verbose_name='Voyez-vous des traces de fourmis électriques?')),
                ('other_observations', models.TextField(blank=True, null=True, verbose_name='Autres observations')),
                ('observer', models.ForeignKey(to=settings.AUTH_USER_MODEL, verbose_name='Observateur')),
            ],
        ),
    ]
