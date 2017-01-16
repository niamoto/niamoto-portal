# coding: utf-8

from django.db import connection, transaction

from apps.niamoto_data.models import Occurrence, OccurrenceObservations, Plot


@transaction.atomic
def set_occurrences_elevation(occurrences_ids=None):
    occ_id_col = OccurrenceObservations.occurrence.field.get_attname()
    if occurrences_ids is None:
        sql = \
            """
                WITH elev AS (
                    SELECT occ.id AS id,
                        ST_Value(mnt.rast, occ.location) AS elevation
                    FROM {occ_table} AS occ
                    LEFT JOIN {elev_raster_table} AS mnt
                    ON ST_Intersects(mnt.rast, occ.location)
                )
                UPDATE {occ_obs}
                SET elevation = elev.elevation
                FROM elev
                WHERE elev.id = {occ_obs}.{occ_id_col};
            """.format(**{
                'occ_table': Occurrence._meta.db_table,
                'elev_raster_table': 'mnt10_wgs84',
                'occ_obs': OccurrenceObservations._meta.db_table,
                'occ_id_col': occ_id_col
            })
    elif len(occurrences_ids) == 0:
        return
    else:
        in_occs = ','.join([str(i) for i in occurrences_ids])
        sql = \
            """
                WITH elev AS (
                    SELECT occ.id AS id,
                        ST_Value(mnt.rast, occ.location) AS elevation
                    FROM {occ_table} AS occ
                    LEFT JOIN {elev_raster_table} AS mnt
                    ON ST_Intersects(mnt.rast, occ.location)
                    WHERE occ.id IN ({in_occs})
                )
                UPDATE {occ_obs}
                SET elevation = elev.elevation
                FROM elev
                WHERE elev.id = {occ_obs}.{occ_id_col};
            """.format(**{
                'occ_table': Occurrence._meta.db_table,
                'elev_raster_table': 'mnt10_wgs84',
                'in_occs': in_occs,
                'occ_obs': OccurrenceObservations._meta.db_table,
                'occ_id_col': occ_id_col
            })
    cur = connection.cursor()
    cur.execute(sql)


@transaction.atomic
def set_plots_elevation():
    sql = \
    """
        UPDATE {plot_table}
        SET elevation = ST_Value(mnt.rast, {plot_table}.location)
        FROM {elev_raster_table} AS mnt
        WHERE ST_Intersects(mnt.rast, {plot_table}.location);
    """.format(**{
        'plot_table': Plot._meta.db_table,
        'elev_raster_table': 'mnt10_wgs84',  # TODO: Not hardcoded
    })
    cur = connection.cursor()
    cur.execute(sql)
