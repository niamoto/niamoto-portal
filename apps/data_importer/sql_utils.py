# coding: utf-8

import pandas as pd


def get_model_fieldnames(model, geom_as_text=True):
    fields = []
    for field in model._meta.fields:
            fields.append(field.get_attname())
    return fields


def get_single_select_field_statement(model, fieldname, geom_as_text=True):
    field = model._meta.get_field(fieldname)
    if geom_as_text and hasattr(field, 'srid'):
        return 'ST_AsText({0}) AS {0}'.format(fieldname)
    return fieldname


def get_select_fields_statements(model, fieldnames, geom_as_text=True):
    return [get_single_select_field_statement(model, f, geom_as_text)
            for f in fieldnames]


def get_geometry_columns_srids(model):
    srid_map = {}
    for field in model._meta.fields:
        if hasattr(field, 'srid'):
            srid_map[field.get_attname()] = field.srid
    return srid_map


def generate_sql_values(dataframe, fields, apply={}, quote_fields=True):
    cols = [dataframe[i].apply(nan_to_null).astype(str) for i in fields]
    df = pd.concat(cols, axis=1)
    for f, func in apply.items():
        df[f] = df[f].apply(func)
    if quote_fields is None:
        quote_fields = {f: True for f in fields}
    elif isinstance(quote_fields, bool):
        quote_fields = {f: quote_fields for f in fields}
    for f, b in quote_fields.items():
        if b:
            df[f] = df[f].apply(quote, axis=1)
    return ','.join(df.apply(','.join, axis=1).apply('({})'.format, axis=1))


def nan_to_null(value, **kwargs):
    if pd.isnull(value):
        return 'NULL'
    return value


def quote(value, **kwargs):
    if value == 'NULL':
        return value
    return "'{}'".format("{}".format(value).replace("'", "''"))


def float_to_int(value, **kwargs):
    if pd.isnull(value):
        return nan_to_null(value)
    if value == 'NULL':
        return value
    return str(int(float(value)))


def geom_from_text(srid):
    def func(value, **kwargs):
        if pd.isnull(value):
            return nan_to_null(value)
        if value == 'NULL':
            return value
        return "ST_GeomFromText('{}', {})".format(value, srid)
    return func

