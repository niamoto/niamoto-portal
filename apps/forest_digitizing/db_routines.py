# coding: utf-8

from django.contrib.auth.models import User
from django.db import connection

from apps.forest_digitizing.spatialite import get_spatialite_cursor


# --------------------- #
# Spatialite to PostGIS #
# --------------------- #

def update_forest3k_from_spatialite(db_path, massif, db_table):
    """
    Update the project database forest fragment 3k table from a spatialite
    file. First delete every entry related to the given massif and finally
    insert every entry stored in the spatialite file.

    :param db_path: The full path of the spatialite file.
    :param massif: The massif to consider for the update.
    :raises: An exception if the procedure fails.
    """
    try:
        forest_fragments = forest3k_from_spatialite(db_path, massif.key_name)
        user_map = get_user_ids_map()
        pg_cursor = connection.cursor()
        # First delete entries related to the massif
        pg_cursor.execute(
            '''
            DELETE FROM {} WHERE massif_id = {};
            '''.format(db_table, massif.id)
        )
        cols = ['uuid', 'created', 'created_by_id', 'modified',
                'modified_by_id', 'comments', 'geom', 'massif_id']
        values = list()
        if len(forest_fragments) == 0:
            return
        for r in forest_fragments:
            row = list()
            for c in cols:
                if c == 'created_by_id':
                    c = 'created_by'
                if c == 'modified_by_id':
                    c = 'modified_by'
                if c == 'geom':
                    row.append("ST_GeomFromText('{}', '32758')".format(r[c]))
                elif c == 'massif_id':
                    row.append("'{}'".format(massif.id))
                elif c in ('created_by', 'modified_by'):
                    if r[c] in user_map:
                        row.append("'{}'".format(user_map[r[c]]))
                    else:
                        row.append('Null')
                elif r[c] is None or r[c] == '':
                    row.append('Null')
                else:
                    row.append("'{}'".format(str(r[c]).replace("'", "''")))
            values.append("({})".format(','.join(row)))
        pg_cursor.execute(
            '''
            INSERT INTO {} ({})
            VALUES {};
            '''.format(db_table, ','.join(cols), ','.join(values))
        )
    except:
        raise


def forest3k_from_spatialite(db_path, massif_key_name):
    """
    Load the forest fragments (3k) of a massif from a spatialite file.
    """
    massif_db_name = get_massif_db_name(massif_key_name)
    with get_spatialite_cursor(db_path) as cursor:
        forest_table = "forest_area_{}_3k".format(massif_db_name)
        cursor.execute(
            '''
            SELECT uuid, created, created_by, modified, modified_by,
                    comments, ST_AsText(GEOMETRY) as geom
            FROM {};
            '''.format(forest_table))
        return cursor.fetchall()


def get_massif_db_name(massif_key_name):
    """
    return the shortened version of massifs names used in spatialite
    files tables.
    """
    return massif_key_name.replace('_', '')


def update_digitizing_problems_from_spatialite(db_path, massif, db_table):
    """
    Update the project database digitizing_problems table from a spatialite
    file. Update the already existing entries and insert the new ones
    (based on the uuid).

    :param db_path: The full path of the spatialite file.
    :param massif: The massif to consider for the update.
    :raises: An exception if the procedure fails.
    """
    try:
        digitizing_problems = digitizing_problems_from_spatialite(db_path)
        if len(digitizing_problems) == 0:
            return
        user_map = get_user_ids_map()
        cols = ('uuid', 'location', 'created', 'modified', 'comments',
                'created_by_id', 'massif_id', 'modified_by_id', 'problem')
        pb_map = {
            'Limite de la forêt': 'Limite de la forêt',
            'Frontière (rivière, piste, ...)': 'Frontière',
            'Visibilité (nuage, ovni...)': 'Visibilité',
            'Autre': 'Autre',
        }
        values = list()
        for pb in digitizing_problems:
            row = list()
            for c in cols:
                if c == 'created_by_id':
                    c = 'created_by'
                if c == 'modified_by_id':
                    c = 'modified_by'
                if c == 'location':
                    row.append("ST_GeomFromText('{}', '32758')".format(pb[c]))
                elif c == 'massif_id':
                    row.append("'{}'".format(massif.id))
                elif c in ('created_by', 'modified_by'):
                    if pb[c] in user_map:
                        row.append("'{}'".format(user_map[pb[c]]))
                    else:
                        row.append('Null')
                elif c == 'problem':
                    val = pb_map[pb[c]] if pb[c] in pb_map else pb[c]
                    row.append("'{}'".format(val))
                elif pb[c] is None or pb[c] == '':
                    row.append('Null')
                else:
                    row.append("'{}'".format(str(pb[c]).replace("'", "''")))
            values.append("({})".format(','.join(row)))
        pg_cursor = connection.cursor()
        pg_cursor.execute(
            """
            BEGIN;

            CREATE TEMPORARY TABLE newpbs (
                uuid uuid,
                location geometry(Point, 32758),
                created timestamp with time zone,
                modified timestamp with time zone,
                comments text,
                created_by_id integer,
                massif_id integer,
                modified_by_id integer,
                problem varchar(255)
            );

            INSERT INTO newpbs ({0}) VALUES {1};

            LOCK TABLE {2} IN EXCLUSIVE MODE;

            UPDATE {2}
            SET location=newpbs.location, modified=newpbs.modified,
                comments=newpbs.comments, problem=newpbs.problem,
                modified_by_id=newpbs.modified_by_id
            FROM newpbs
            WHERE newpbs.uuid={2}.uuid;

            INSERT INTO {2} ({0})
            SELECT {3}
            FROM newpbs
            LEFT OUTER JOIN {2} ON ({2}.uuid = newpbs.uuid)
            WHERE {2}.uuid IS NULL;
            """.format(','.join(cols), ','.join(values), db_table,
                       ','.join(['newpbs.{}'.format(i) for i in cols])))
    except:
        raise


def digitizing_problems_from_spatialite(db_path):
    """
    Load the digitizing problems of a massif from a spatialite file.
    """
    with get_spatialite_cursor(db_path) as cursor:
        # Query problems
        cursor.execute(
            '''
            SELECT uuid, created, created_by, modified, modified_by,
                    problem, comments, ST_AsText(GEOMETRY) as location
            FROM digitazing_problem;
            ''')
        return cursor.fetchall()


def get_user_ids_map():
    users = User.objects.all()
    user_map = {}
    for u in users:
        user_map[u.get_full_name()] = u.id
    return user_map


# --------------------- #
# PostGIS to Spatialite #
# --------------------- #


def replace_spatialite_digitizing_problems(massif_key_name, spatialite_path):
    """
    Delete all problems from a given spatialite and replace them by what is
    actually on the webapp PostGIS database.
    """
    columns, problems = digitizing_problems_from_postgis(massif_key_name)
    with get_spatialite_cursor(spatialite_path) as cursor:
        cursor.execute(""" DELETE FROM digitazing_problem; """)
        cursor.execute(""" INSERT INTO digitazing_problem ({}) VALUES {}; """
                       .format(','.join(columns),
                               ','.join(['({})'.format(','.join(pb))
                                         for pb in problems])))


def digitizing_problems_from_postgis(massif_key_name):
    """
    Load the digitizing problems of a massif from the webapp postgis db.
    :param massif_key_name
    :return: An array containing the loaded problem in this order:
        ['uuid', 'created', 'created_by', 'modified', 'modified_by',
         'problem', 'comments', 'GEOMETRY']
    """
    with connection.cursor() as pg_cursor:
        # Query all problems from PostGIS
        pg_cursor.execute(
            """
            SELECT problem_tb.uuid,
                    problem_tb.created,
                    problem_tb.created_by_id,
                    problem_tb.modified,
                    problem_tb.modified_by_id,
                    problem_tb.problem,
                    problem_tb.comments,
                    ST_AsText(problem_tb.location) AS geometry
            FROM forest_digitizing_digitizingproblem AS problem_tb
            LEFT JOIN forest_digitizing_massif AS massif_tb
                ON problem_tb.massif_id = massif_tb.id
            WHERE massif_tb.key_name = '{}';
            """.format(massif_key_name)
        )
        problems = pg_cursor.fetchall()
        columns = ['uuid', 'created', 'created_by', 'modified',
                   'modified_by', 'problem', 'comments', 'geometry']
        user_map = get_reverse_user_ids_map()
        to_return = list()
        for pb in problems:
            row = [v for v in pb]
            row[2] = user_map[pb[2]]
            if row[4] is not None:
                row[4] = user_map[pb[4]]
            r = ["'{}'".format(str(v).replace("'", "''"))
                       .replace("None", '') for v in row]
            r[7] = "ST_GeomFromText('{}', 32758)".format(pb[7])
            to_return.append(r)
        return columns, to_return


def get_reverse_user_ids_map():
    users = User.objects.all()
    user_map = {}
    for u in users:
        user_map[u.id] = u.get_full_name()
    return user_map
