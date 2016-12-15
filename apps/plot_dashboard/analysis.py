# coding: utf-8

from sqlalchemy.engine import create_engine
import pandas as pd

from utils import get_sqlalchemy_connection_string


def get_occurrences_by_plot(plot_id=None):
    """
    Return a list of occurrences being in a plot.

    The family of each occurrence is obtained using the tree_id column,
    according to the MPPT structure of the taxon table. Since FAMILY is the
    highest possible level in the taxon table, the tree_id value always refer
    to the family a taxon belongs to. WARNING: this is only possible because
    FAMILY had been defined as the highest possible level, in case of changes,
    this function will have to be adapted.

    :param plot_id: The id of the plot.
    :return: Occurrences as a Pandas dataframe.
    """

    sql = \
        """
        SELECT plot_id,
               plot.name AS plot_name,
               occurrence.id AS occ_id,
               identifier AS identifier,
               taxon.id AS taxon_id,
               taxon.rank AS taxon_rank,
               taxon.full_name AS taxon_full_name,
               family.id AS family_id,
               family.full_name AS family_full_name,
               observations.height AS height,
               observations.stem_nb AS stem_nb,
               observations.dbh AS dbh,
               observations.status AS status,
               observations.wood_density AS wood_density,
               observations.bark_thickness AS bark_thickness
        FROM niamoto_data_plotoccurrences
        INNER JOIN niamoto_data_plot AS plot ON plot_id = plot.id
        INNER JOIN niamoto_data_occurrence AS occurrence ON occurrence_id = occurrence.id
        LEFT JOIN niamoto_data_occurrenceobservations AS observations ON occurrence.id = observations.occurrence_id
        LEFT JOIN niamoto_data_taxon AS taxon ON occurrence.taxon_id = taxon.id
        LEFT JOIN (
            SELECT id, full_name, tree_id
            FROM niamoto_data_taxon
            WHERE rank = 'FAMILY'
            GROUP BY id, full_name, tree_id
        ) AS family ON taxon.tree_id = family.tree_id
        WHERE {0} IS NULL OR plot.id = {0};
        """.format('NULL' if plot_id is None else plot_id)
    engine = create_engine(get_sqlalchemy_connection_string())
    conn = engine.connect()
    df = pd.read_sql_query(
        sql,
        conn
    )
    return df


def get_families_distribution(dataframe, limit=None):
    df = dataframe.groupby(['family_id']).agg({
        'family_full_name': 'first',
        'occ_id': 'count',
    }).sort_values(by='occ_id', ascending=False)
    df.rename(columns={'occ_id': 'nb_occurrences'}, inplace=True)
    df['proportion'] = df['nb_occurrences'].groupby(level=0).apply(
        lambda x: x/df['nb_occurrences'].sum()
    )
    return df if limit is None else df.head(limit)


def get_species_distribution(dataframe, limit=None):
    df = dataframe[dataframe['taxon_rank'] == 'SPECIE']
    df = df.groupby(['taxon_id']).agg({
        'taxon_full_name': 'first',
        'occ_id': 'count'
    }).sort_values(by='occ_id', ascending=False)
    df.rename(columns={'occ_id': 'nb_occurrences'}, inplace=True)
    df['proportion'] = df['nb_occurrences'].groupby(level=0).apply(
        lambda x: x/df['nb_occurrences'].sum()
    )
    return df if limit is None else df.head(limit)


def get_dbh_classification(dataframe, bin_size=10):
    max_dbh = dataframe['dbh'].max()  # TODO CHANGE TO DBH
    bins = [10 * i for i in range(int(max_dbh // bin_size + 2))]
    dbh_class = pd.cut(dataframe['dbh'], bins)
    return dbh_class.value_counts(sort=False)
