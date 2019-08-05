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
               plot.basal_area as basal_area,
               occurrence.id AS occ_id,
               identifier AS identifier,
               taxon.id AS taxon_id,
               taxon.rank AS taxon_rank,
               taxon.full_name AS taxon_full_name,
               family.id AS family_id,
               family.full_name AS family_full_name,
               specie_parent.id AS specie_parent_id,
               specie_parent.full_name AS specie_parent_full_name,
               specie_parent.rank AS specie_parent_rank,
               genus_parent.id AS genus_parent_id,
               genus_parent.full_name AS genus_parent_full_name,
               occurrence.height AS height,
               occurrence.stem_nb AS stem_nb,
               occurrence.dbh AS dbh,
               occurrence.status AS status,
               occurrence.wood_density AS wood_density,
               occurrence.bark_thickness AS bark_thickness
        FROM niamoto_data_plotoccurrences
        INNER JOIN niamoto_data_plot AS plot ON plot_id = plot.id
        LEFT JOIN niamoto_data_occurrence AS occurrence ON occurrence_id = occurrence.id
        LEFT JOIN niamoto_data_taxon AS taxon ON occurrence.taxon_id = taxon.id
        /* SPECIE */
        LEFT JOIN niamoto_data_taxon AS specie_parent ON specie_parent.tree_id = taxon.tree_id
          AND specie_parent.lft <= taxon.lft
          AND specie_parent.rght >= taxon.rght
          AND specie_parent.rank = 'SPECIE'
        /* GENUS */
        LEFT JOIN niamoto_data_taxon AS genus_parent ON genus_parent.tree_id = taxon.tree_id
          AND genus_parent.lft <= taxon.lft
          AND genus_parent.rght >= taxon.rght
          AND genus_parent.rank = 'GENUS'
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
    total = df['nb_occurrences'].sum()
    df['proportion'] = df['nb_occurrences'].groupby(level=0).apply(
        lambda x: x/total
    )
    if limit is None or limit > len(df):
        return df, total
    to_return = df.head(limit)
    others = df.tail(len(df) - limit).sum()
    others['family_full_name'] = "Autres"
    to_return = to_return.append(
        others,
                ignore_index=True
    )
    return to_return, total


def get_species_distribution(dataframe, limit=None):
    df = dataframe[dataframe['taxon_rank'] == 'SPECIE']
    df = df.groupby(['taxon_id']).agg({
        'taxon_full_name': 'first',
        'occ_id': 'count'
    }).sort_values(by='occ_id', ascending=False)
    df.rename(columns={'occ_id': 'nb_occurrences'}, inplace=True)
    total = df['nb_occurrences'].sum()
    df['proportion'] = df['nb_occurrences'].groupby(level=0).apply(
        lambda x: x / total
    )
    if limit is None or limit > len(df):
        return df, total
    to_return = df.head(limit)
    others = df.tail(len(df) - limit).sum()
    others['taxon_full_name'] = "Autres"
    to_return = to_return.append(
        others,
        ignore_index=True
    )
    return to_return, total


def get_dbh_classification(dataframe, bin_size=10):
    if len(dataframe['dbh']) == 0:
        return [], []
    max_dbh = dataframe['dbh'].max()
    bins = [bin_size * i for i in range(int(max_dbh // bin_size + 2))]
    dbh = dataframe['dbh']
    dbh_class = pd.cut(
        dbh,
        bins,
        right=False,
        include_lowest=True
    )
    import pdb; pdb.set_trace()
    value_counts = dbh_class.value_counts(sort=False)
    value_counts = (100 * value_counts / value_counts.sum()).round(1)
    return bins[2:], value_counts[2:]


def get_richness(dataframe):
    df = dataframe[pd.notnull(dataframe['taxon_id'])]
    f = df[pd.notnull(df['family_id'])]['family_id'].unique()
    g = df[pd.notnull(df['genus_parent_id'])]['genus_parent_id'].unique()
    s = df[pd.notnull(df['specie_parent_id'])]['specie_parent_id'].unique()
    return {
        'nb_families': len(f),
        'nb_species': len(s),
        'nb_genus': len(g),
    }


def get_plots_info():
    """
    Return a list of item plots.

    :return: a list of item plots.
    """

    sql = \
        """
        SELECT MAX(basal_area) as basal_area_max,
                MAX(h_mean) as h_mean_max
        FROM niamoto_data_plot;"""
    engine = create_engine(get_sqlalchemy_connection_string())
    conn = engine.connect()
    df = pd.read_sql_query(
        sql,
        conn
    )
    return df
