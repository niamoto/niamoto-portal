# coding: utf-8

from django.test import TransactionTestCase
import pandas as pd
from pandas.util.testing import assert_frame_equal

from apps.data_importer import BaseDataImporter
from apps.niamoto_data.models import Plot


class BaseDataImporterTest(TransactionTestCase):

    TEST_MODEL = Plot

    # Test insert
    DF1 = pd.DataFrame([
        (0, 'plot_0', 100.0, 100.0, 'POINT(165.21972 -20.81833333)'),
        (1, 'plot_1', 100.0, 100.0, 'POINT(165.21973 -20.81833333)'),
        (2, 'plot_2', 100.0, 100.0, 'POINT(165.2198 -20.815)'),
        (3, 'plot_3', 100.0, 100.0, 'POINT(165.2197 -20.8283)'),
        (4, 'plot_4', 100.0, 100.0, 'POINT(165.2191 -20.818334)'),
    ], columns=['id', 'name', 'width', 'height', 'location'])
    DF1.set_index('id', inplace=True, drop=False)

    # Test update
    DF2 = pd.DataFrame([
        (0, 'plot_0', 20.0, 20.0, 'POINT(165.21972 -20.81833333)'),
        (1, 'plot_1', 100.0, 100.0, 'POINT(165.21973 -20.81833333)'),
        (2, 'plot_2', 100.0, 100.0, 'POINT(165.2198 -20.815)'),
        (3, 'plot_3', 50.0, 50.0, 'POINT(165.2197 -20.82)'),
        (4, 'plot_4', 100.0, 100.0, 'POINT(165.91 -20.818334)'),
    ], columns=['id', 'name', 'width', 'height', 'location'])
    DF2.set_index('id', inplace=True, drop=False)

    # Test delete
    DF3 = pd.DataFrame([
        (0, 'plot_0', 20.0, 20.0, 'POINT(165.21972 -20.81833333)'),
        (2, 'plot_2', 100.0, 100.0, 'POINT(165.2198 -20.815)'),
    ], columns=['id', 'name', 'width', 'height', 'location'])
    DF3.set_index('id', inplace=True, drop=False)

    def setUp(self):
        pass

    def test_base_attributes(self):
        di = BaseDataImporter(self.TEST_MODEL, self.DF1)
        self.assertListEqual(di.niamoto_fields, [
            'id', 'name', 'width', 'height', 'location'
        ])
        self.assertEqual(len(di.niamoto_dataframe), 0)
        assert_frame_equal(di.external_dataframe, self.DF1)
        self.assertEqual(di.get_index_col(), 'id')

    def test_insert_data(self):
        di = BaseDataImporter(self.TEST_MODEL, self.DF1)
        insert = di.insert_dataframe
        assert_frame_equal(insert, self.DF1)
        self.assertEqual(len(di.delete_dataframe), 0)
        self.assertEqual(len(di.update_dataframe_new), 0)
        self.assertEqual(len(di.update_dataframe_current), 0)
        di.process_import()
        assert_frame_equal(di.niamoto_dataframe, self.DF1)

    def test_update_data(self):
        # First import DF1
        di = BaseDataImporter(self.TEST_MODEL, self.DF1)
        di.process_import()
        # Now test update
        di = BaseDataImporter(self.TEST_MODEL, self.DF2)
        update_current = di.update_dataframe_current
        update_new = di.update_dataframe_new
        u = [0, 3, 4]  # Expected update indices
        assert_frame_equal(update_current, di.niamoto_dataframe.loc[u])
        assert_frame_equal(update_new, self.DF2.loc[u])
        self.assertEqual(len(di.insert_dataframe), 0)
        self.assertEqual(len(di.delete_dataframe), 0)
        di.process_import()
        assert_frame_equal(di.niamoto_dataframe, self.DF2)

    def test_delete_data(self):
        # First import DF2
        di = BaseDataImporter(self.TEST_MODEL, self.DF2)
        di.process_import()
        # Now test delete
        di = BaseDataImporter(self.TEST_MODEL, self.DF3)
        delete = di.delete_dataframe
        d = [1, 3, 4]  # Expected delete indices
        assert_frame_equal(delete, di.niamoto_dataframe.loc[d])
        self.assertEqual(len(di.insert_dataframe), 0)
        self.assertEqual(len(di.update_dataframe_new), 0)
        self.assertEqual(len(di.update_dataframe_current), 0)
        di.process_import()
        assert_frame_equal(di.niamoto_dataframe, self.DF3)
