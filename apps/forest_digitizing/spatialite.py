# coding: utf-8

import os
import sqlite3
from contextlib import contextmanager


@contextmanager
def get_spatialite_cursor(file_path):
    connection = None
    try:
        connection = sqlite3.connect(file_path)
        connection.enable_load_extension(True)
        if os.name == 'nt':
            connection.execute('''
            SELECT load_extension("mod_spatialite.dll")
            ''')
        else:
            connection.execute('''
            SELECT load_extension("/usr/local/lib/mod_spatialite.so")
            ''')
        connection.row_factory = dict_factory
        yield connection.cursor()
        connection.commit()
    except:
        if connection is not None:
            connection.rollback()
        raise
    finally:
        if connection is not None:
            connection.close()


def dict_factory(cursor, row):
    d = dict()
    for i, col in enumerate(cursor.description):
        d[col[0]] = row[i]
    return d
