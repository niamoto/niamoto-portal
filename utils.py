# coding: utf-8

from collections import OrderedDict


def dict_fetchall(cursor):
    """
    Return all rows from a cursor as a dict"""
    columns = [col[0] for col in cursor.description]
    return [
        OrderedDict(zip(columns, row))
        for row in cursor.fetchall()
    ]
