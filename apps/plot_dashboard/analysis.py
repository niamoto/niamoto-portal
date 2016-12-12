# coding: utf-8

from sqlalchemy.engine import create_engine
import pandas as pd

from utils import get_sqlalchemy_connection_string


def get_occurrences_by_plot(plot_id=None):
    """
    Return a list of occurrences being in a plot.
    :param plot_id: The id of the plot.
    :return: Occurrences as a Pandas dataframe.
    """

    sql = \
        """
        SELECT plot_id,
               plot.name AS plot_name,
               identifier AS identifier,
               taxon.id AS taxon_id,
               taxon.rank AS taxon_rank,
               taxon.full_name AS taxon_full_name,
               observations.height AS height,
               observations.stem_nb AS stem_nb,
               observations.circumference AS circumference,
               observations.status AS status,
               observations.wood_density AS wood_density,
               observations.bark_thickness AS bark_thickness
        FROM niamoto_data_plotoccurrences
        INNER JOIN niamoto_data_plot AS plot ON plot_id = plot.id
        INNER JOIN niamoto_data_occurrence AS occurrence ON occurrence_id = occurrence.id
        LEFT JOIN niamoto_data_occurrenceobservations AS observations ON occurrence.id = observations.occurrence_id
        LEFT JOIN niamoto_data_taxon AS taxon ON occurrence.taxon_id = taxon.id
        WHERE {0} IS NULL OR plot.id = {0};
        """.format('NULL' if plot_id is None else plot_id)
    engine = create_engine(get_sqlalchemy_connection_string())
    conn = engine.connect()
    df = pd.read_sql_query(
        sql,
        conn
    )
    return df
