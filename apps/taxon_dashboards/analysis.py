# coding: utf-8

from django.db import connection
import numpy as np


def get_occurrences_total_count():
    """
    :return: The total number of occurrences in the database.
    """
    sql = "SELECT count(*) FROM niamoto_data_occurrence;"
    cursor = connection.cursor()
    cursor.execute(sql)
    count = cursor.fetchone()
    return count[0]


def get_occurrences_by_taxon(taxon_id=None):
    """
    Return a list of occurrences filtered by a taxon_id. The occurrences
    returned are descendant of the taxon corresponding to the taxon_id
    parameter. For instance, if it corresponds to a family, every genus and
    species that belong to this family will be returned.
    :param taxon_id: The taxon'id for filtering
    :return: A list of occurrences, as an array where each row corresponding
    to an occurrence.
    """
    sql = """
        SELECT occ.id,
            tax.id,
            tax.rank,
            tax.full_name,
            tax.rank_name,
            obs.height,
            /* When stem_nb is None, set it to 1 (numpy int cannot be NaN)*/
            COALESCE(obs.stem_nb, 1),
            obs.circumference,
            obs.status,
            obs.wood_density,
            obs.bark_thickness,
            ST_X(occ.location) as x,
            ST_Y(occ.location) as y
        FROM niamoto_data_occurrence AS occ
        LEFT JOIN niamoto_data_taxon AS tax
            ON occ.taxon_id = tax.id
        LEFT JOIN niamoto_data_occurrenceobservations AS obs
            ON occ.id = obs.occurrence_id
        LEFT JOIN niamoto_data_taxon AS root
            ON root.id = '{}'
        WHERE root.id IS NULL OR
            (tax.tree_id = root.tree_id AND tax.lft BETWEEN root.lft AND root.rght)
    """.format(taxon_id)
    cursor = connection.cursor()
    cursor.execute(sql)
    occurrences = cursor.fetchall()
    return np.array(
        occurrences,
        dtype=[('occ_id', 'int'), ('tax_id', 'int'), ('tax_rank', 'U50'),
               ('tax_full_name', 'U300'), ('tax_rank_name', 'U300'),
               ('height', 'float'), ('stem_nb', 'int'),
               ('circumference', 'float'), ('status', 'U50'),
               ('wood_density', 'float'), ('bark_thickness', 'float'),
               ('x', 'float'), ('y', 'float')]
    )


def get_coordinates(dataset, remove_duplicates=True):
    coordinates = np.column_stack((dataset['x'], dataset['y']))
    if remove_duplicates:
        order = np.lexsort(coordinates.T)
        coordinates = coordinates[order]
        diff = np.diff(coordinates, axis=0)
        ui = np.ones(len(coordinates), 'bool')
        ui[1:] = (diff != 0).any(axis=1)
        coordinates = coordinates[ui]
    return coordinates


def get_stats(dataset, field_name):
    """
    :param dataset: A dataset.
    :param field_name: The field_name to slice for the stats.
    :return: Basic stats about a field of a dataset (min, max, nb_obs, avg).
    """
    field = dataset[field_name]
    _min = np.nanmin(field)
    _max = np.nanmax(field)
    _avg = np.nanmean(field)
    stats = {
        'nb_obs': np.count_nonzero(~np.isnan(field)),
        'min': _min if not np.isnan(_min) else None,
        'max': _max if not np.isnan(_max) else None,
        'avg': _avg if not np.isnan(_avg) else None,
    }
    return stats


def get_height_stats(dataset):
    return get_stats(dataset, 'height')


def get_circumference_stats(dataset):
    return get_stats(dataset, 'circumference')


def get_wood_density_stats(dataset):
    return get_stats(dataset, 'wood_density')


def get_bark_thickness_stats(dataset):
    return get_stats(dataset, 'bark_thickness')


def get_stem_nb_stats(dataset):
    return get_stats(dataset, 'stem_nb')


def get_taxon_distribution(dataset):
    tax_col = dataset['tax_full_name']
    unique, counts = np.unique(tax_col, return_counts=True)
    return zip(unique, counts)
