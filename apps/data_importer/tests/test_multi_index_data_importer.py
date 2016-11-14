# coding: utf-8

from datetime import datetime

from django.test import TransactionTestCase
import pandas as pd
from pandas.util.testing import assert_frame_equal

from apps.data_importer import \
    BaseDataImporter, MultiIndexDataImporter
from apps.niamoto_data.models import Plot, Occurrence, PlotOccurrences


class MultiIndexDataImporterTest(TransactionTestCase):

    TEST_MODEL = Plot

    # Test insert
    DF1 = pd.DataFrame([
        (0, 1, 'a'),
        (1, 1, 'b'),
        (2, 1, 'c'),
        (2, 2, 'a'),
        (3, 2, 'b'),
    ], columns=['occurrence_id', 'plot_id', 'identifier'])
    DF1.set_index(['occurrence_id', 'plot_id'], inplace=True, drop=False)

    # Test update
    DF2 = pd.DataFrame([
        (0, 1, 'a'),
        (1, 1, 'bebe'),
        (2, 1, 'cadum'),
        (2, 2, 'a'),
        (3, 2, 'b'),
    ], columns=['occurrence_id', 'plot_id', 'identifier'])
    DF2.set_index(['occurrence_id', 'plot_id'], inplace=True, drop=False)

    # Test delete
    DF3 = pd.DataFrame([
        (2, 1, 'cadum'),
        (2, 2, 'a'),
    ], columns=['occurrence_id', 'plot_id', 'identifier'])
    DF3.set_index(['occurrence_id', 'plot_id'], inplace=True, drop=False)

    def setUp(self):
        # Insert plots
        plots = pd.DataFrame([
            (0, 'plot_0', 100.0, 100.0, 'POINT(165.21972 -20.81833333)'),
            (1, 'plot_1', 100.0, 100.0, 'POINT(165.21973 -20.81833333)'),
            (2, 'plot_2', 100.0, 100.0, 'POINT(165.21975 -20.81833333)'),
        ], columns=['id', 'name', 'width', 'height', 'location'])
        plots.set_index('id', inplace=True, drop=False)
        di = BaseDataImporter(Plot, plots)
        di.process_import()
        # Insert Occurrences
        now = str(datetime.now())
        occs = pd.DataFrame([
            (0, '2016/10/03', now, now, None, 'POINT(165.21972 -20.81833333)'),
            (1, '2016/10/03', now, now, None, 'POINT(165.21972 -20.81833333)'),
            (2, '2016/10/03', now, now, None, 'POINT(165.21972 -20.81833333)'),
            (3, '2016/10/03', now, now, None, 'POINT(165.21972 -20.81833333)'),
        ], columns=['id', 'date', 'created_at', 'updated_at',
                    'taxon_id', 'location'])
        occs.set_index('id', inplace=True, drop=False)
        di = BaseDataImporter(Occurrence, occs)
        di.process_import()

    def test_base_attributes(self):
        di = MultiIndexDataImporter(
            PlotOccurrences,
            self.DF1,
            index_cols=['occurrence_id', 'plot_id'],
            update_fields=['identifier'],
            niamoto_fields=['occurrence_id', 'plot_id', 'identifier']
        )
        self.assertListEqual(di.niamoto_fields, [
            'occurrence_id', 'plot_id', 'identifier'
        ])
        self.assertEqual(len(di.niamoto_dataframe), 0)
        assert_frame_equal(di.external_dataframe, self.DF1)

    def test_insert_data(self):
        di = MultiIndexDataImporter(
            PlotOccurrences,
            self.DF1,
            index_cols=['occurrence_id', 'plot_id'],
            update_fields=['identifier'],
            niamoto_fields=['occurrence_id', 'plot_id', 'identifier']
        )
        insert = di.insert_dataframe
        assert_frame_equal(insert, self.DF1)
        self.assertEqual(len(di.delete_dataframe), 0)
        self.assertEqual(len(di.update_dataframe_new), 0)
        self.assertEqual(len(di.update_dataframe_current), 0)
        di.process_import()
        assert_frame_equal(di.niamoto_dataframe, self.DF1)

    def test_update_data(self):
        # First import DF1
        di = MultiIndexDataImporter(
            PlotOccurrences,
            self.DF1,
            index_cols=['occurrence_id', 'plot_id'],
            update_fields=['identifier'],
            niamoto_fields=['occurrence_id', 'plot_id', 'identifier']
        )
        di.process_import()
        # Now test update
        di = MultiIndexDataImporter(
            PlotOccurrences,
            self.DF2,
            index_cols=['occurrence_id', 'plot_id'],
            update_fields=['identifier'],
            niamoto_fields=['occurrence_id', 'plot_id', 'identifier']
        )
        update_current = di.update_dataframe_current
        update_new = di.update_dataframe_new
        u = [1, 2]  # Expected update indices
        assert_frame_equal(update_current, di.niamoto_dataframe.iloc[u])
        assert_frame_equal(update_new, self.DF2.iloc[u])
        self.assertEqual(len(di.insert_dataframe), 0)
        self.assertEqual(len(di.delete_dataframe), 0)
        di.process_import()
        assert_frame_equal(di.niamoto_dataframe, self.DF2)

    def test_delete_data(self):
        # First import DF2
        di = MultiIndexDataImporter(
            PlotOccurrences,
            self.DF2,
            index_cols=['occurrence_id', 'plot_id'],
            update_fields=['identifier'],
            niamoto_fields=['occurrence_id', 'plot_id', 'identifier']
        )
        di.process_import()
        # Now test delete
        di = MultiIndexDataImporter(
            PlotOccurrences,
            self.DF3,
            index_cols=['occurrence_id', 'plot_id'],
            update_fields=['identifier'],
            niamoto_fields=['occurrence_id', 'plot_id', 'identifier']
        )
        delete = di.delete_dataframe
        d = [0, 1, 4]  # Expected delete indices
        assert_frame_equal(delete, di.niamoto_dataframe.iloc[d])
        self.assertEqual(len(di.insert_dataframe), 0)
        self.assertEqual(len(di.update_dataframe_new), 0)
        self.assertEqual(len(di.update_dataframe_current), 0)
        di.process_import()
        assert_frame_equal(di.niamoto_dataframe, self.DF3)
