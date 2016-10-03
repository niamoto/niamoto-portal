# coding: utf-8

from django.test import TransactionTestCase
import pandas as pd
from pandas.util.testing import assert_frame_equal

from apps.niamoto_plantnote.data_io.data_importer import \
    BaseDataImporter, ExtendedModelDataImporter, MultiIndexDataImporter
from apps.niamoto_data.models import Plot, Occurrence, PlotOccurrences
from apps.niamoto_plantnote.models import PlantnoteOccurrence


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
        occs = pd.DataFrame([
            (0, '2016/10/03', None, 'POINT(165.21972 -20.81833333)'),
            (1, '2016/10/03', None, 'POINT(165.21972 -20.81833333)'),
            (2, '2016/10/03', None, 'POINT(165.21972 -20.81833333)'),
            (3, '2016/10/03', None, 'POINT(165.21972 -20.81833333)'),
        ], columns=['id', 'date', 'taxon_id', 'location',])
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
