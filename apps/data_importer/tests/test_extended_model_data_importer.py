# coding: utf-8

from django.test import TransactionTestCase
import pandas as pd
from pandas.util.testing import assert_frame_equal

from apps.data_importer import \
    ExtendedModelDataImporter
from apps.niamoto_data.models import Occurrence
from apps.niamoto_plantnote.models import PlantnoteOccurrence


class ExtendedModelDataImporterTest(TransactionTestCase):

    # Test insert
    DF1 = pd.DataFrame([
        (200, '2016/10/03', None, 'POINT(165.21972 -20.81833333)', 'A'),
        (201, '2016/10/03', None, 'POINT(165.21973 -20.81833333)', 'B'),
        (202, '2016/10/03', None, 'POINT(165.2198 -20.815)', 'C'),
        (203, '2016/10/03', None, 'POINT(165.2197 -20.8283)', 'D'),
        (204, '2016/10/03', None, 'POINT(165.2191 -20.818334)', 'E'),
    ], columns=['plantnote_id', 'date', 'taxon_id', 'location', 'collector'])
    DF1.set_index('plantnote_id', inplace=True, drop=False)

    # Test update
    DF2 = pd.DataFrame([
        (200, '2016/10/03', None, 'POINT(165.21972 -20.81833333)', 'A'),
        (201, '2011/04/03', None, 'POINT(165.219 -20.818)', 'ZZZ'),
        (202, '2016/10/03', None, 'POINT(165.2198 -20.815)', 'C'),
        (203, '2016/10/03', None, 'POINT(165.2198 -20.8283)', 'D'),
        (204, '2016/10/03', None, 'POINT(165.2193 -20.818334)', 'E'),
    ], columns=['plantnote_id', 'date', 'taxon_id', 'location', 'collector'])
    DF2.set_index('plantnote_id', inplace=True, drop=False)


    # Test update
    DF3 = pd.DataFrame([
        (200, '2016/10/03', None, 'POINT(165.21972 -20.81833333)', "A"),
        (204, '2016/10/03', None, 'POINT(165.2193 -20.818334)', "E"),
    ], columns=['plantnote_id', 'date', 'taxon_id', 'location', 'collector'])
    DF3.set_index('plantnote_id', inplace=True, drop=False)


    def setUp(self):
        pass

    def test_base_attributes(self):
        di = ExtendedModelDataImporter(
            Occurrence,
            PlantnoteOccurrence,
            self.DF1
        )
        self.assertListEqual(di.niamoto_fields, [
            'id', 'date', 'taxon_id', 'location'
        ])
        self.assertEqual(di.niamoto_extended_fields, [
            'occurrence_ptr_id', 'plantnote_id', 'collector'
        ])
        self.assertEqual(len(di.niamoto_dataframe), 0)
        assert_frame_equal(di.external_dataframe, self.DF1)
        self.assertEqual(di.get_index_col(), 'id')
        self.assertEqual(di.get_external_index_col(), 'plantnote_id')
        self.assertEqual(di.get_extended_index_col(), 'occurrence_ptr_id')

    def test_insert_data(self):
        di = ExtendedModelDataImporter(
            Occurrence,
            PlantnoteOccurrence,
            self.DF1
        )
        insert = di.insert_dataframe
        assert_frame_equal(insert, self.DF1)
        self.assertEqual(len(di.delete_dataframe), 0)
        self.assertEqual(len(di.update_dataframe_new), 0)
        self.assertEqual(len(di.update_dataframe_current), 0)
        di.process_import()
        a = di.niamoto_dataframe.drop(di.get_external_index_col(), 1)
        b = self.DF1.drop(di.get_external_index_col(), 1)
        assert_frame_equal(a, b)

    def test_update_data(self):
        # First import DF1
        di = ExtendedModelDataImporter(
            Occurrence,
            PlantnoteOccurrence,
            self.DF1
        )
        di.process_import()
        # Now test update
        di = ExtendedModelDataImporter(
            Occurrence,
            PlantnoteOccurrence,
            self.DF2
        )
        update_current = di.update_dataframe_current
        update_new = di.update_dataframe_new
        u = [201, 203, 204]  # Expected update indices
        assert_frame_equal(update_current, di.niamoto_dataframe.loc[u])
        assert_frame_equal(update_new, self.DF2.loc[u])
        di.process_import()
        a = di.niamoto_dataframe.drop(di.get_external_index_col(), 1)
        b = self.DF2.drop(di.get_external_index_col(), 1)
        assert_frame_equal(a, b)

    def test_delete_data(self):
        # First import DF2
        di = ExtendedModelDataImporter(
            Occurrence,
            PlantnoteOccurrence,
            self.DF2
        )
        di.process_import()
        # Now test delete
        di = ExtendedModelDataImporter(
            Occurrence,
            PlantnoteOccurrence,
            self.DF3
        )
        delete = di.delete_dataframe
        d = [201, 202, 203]  # Expected delete indices
        assert_frame_equal(delete, di.niamoto_dataframe.loc[d])
        di.process_import()
        a = di.niamoto_dataframe.drop(di.get_external_index_col(), 1)
        b = self.DF3.drop(di.get_external_index_col(), 1)
        assert_frame_equal(a, b)
