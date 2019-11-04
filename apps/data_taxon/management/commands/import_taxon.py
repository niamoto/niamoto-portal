from django.core.management.base import BaseCommand, CommandError
import csv
import os
from pathlib import Path
from apps.data_taxon.models import Taxon


class Command(BaseCommand):
    help = 'Import data Taxon'

    def add_arguments(self, parser):
        parser.add_argument(
            'csv', nargs='+', help='struct file (delimiter ;): id, full_name, rank_name, parent_id, id_endemia, id_rang, occ_count, plot_count')

    def handle(self, *args, **options):
        file_path = Path(options['csv'][0])
        try:
            absolute_path = file_path.resolve(strict=True)
        except FileNotFoundError:
            raise CommandError('the file "%s" does not exist' % file_path)

        with open(options['csv'][0], newline='') as csvfile:
            # Drop table
            Taxon.objects.all().delete()
            # insert records
            spamreader = csv.reader(csvfile, delimiter=';', quotechar='|')
            for row in spamreader:
                id = row[0]
                full_name = row[1]
                rank_name = row[2]
                id_endemia = row[4]
                id_rang = row[5]
                occ_count = row[6]
                plot_count = row[7]
                try:
                    parent = Taxon.objects.get(pk=row[3])
                    taxon = Taxon.objects.create(
                        id=id, full_name=full_name, rank_name=rank_name, parent=parent, id_endemia=id_endemia, id_rang=id_rang, occ_count=occ_count, plot_count=plot_count)
                except:
                    taxon = Taxon.objects.create(
                        id=id, full_name=full_name, rank_name=rank_name, id_endemia=id_endemia, id_rang=id_rang, occ_count=occ_count, plot_count=plot_count)
            print('import finished')
