# coding: utf-8

from collections import OrderedDict

from django.core.mail.backends.smtp import EmailBackend
from django.db import connection
from django.conf import settings


def dict_fetchall(cursor):
    """
    Return all rows from a cursor as a dict
    """
    columns = [col[0] for col in cursor.description]
    return [
        OrderedDict(zip(columns, row))
        for row in cursor.fetchall()
    ]


def get_email_backend():
    from constance import config
    return EmailBackend(
        host=config.EMAIL_HOST,
        port=config.EMAIL_PORT,
        username=config.EMAIL_HOST_USER,
        password=config.EMAIL_HOST_PASSWORD,
        use_tls=config.EMAIL_USE_TLS
    )


def get_default_from_email():
    from constance import config
    return config.DEFAULT_FROM_EMAIL


def get_sqlalchemy_connection_string():
    """
    :return: A sqlalchemy connection string to the niamoto database.
    """
    db = settings.DATABASES['default']
    return "postgresql://{}:{}@{}:{}/{}".format(
        db['USER'],
        db['PASSWORD'],
        db['HOST'],
        db['PORT'],
        db['NAME']
    )

def fix_db_sequences():
    fix_db_sequences_ownership()
    cur = connection.cursor()
    cur.execute(
        """
        SELECT 'SELECT SETVAL(' ||
               quote_literal(quote_ident(PGT.schemaname) || '.' || quote_ident(S.relname)) ||
               ', COALESCE(MAX(' ||quote_ident(C.attname)|| '), 1) ) FROM ' ||
               quote_ident(PGT.schemaname)|| '.'||quote_ident(T.relname)|| ';'
        FROM pg_class AS S,
             pg_depend AS D,
             pg_class AS T,
             pg_attribute AS C,
             pg_tables AS PGT
        WHERE S.relkind = 'S'
            AND S.oid = D.objid
            AND D.refobjid = T.oid
            AND D.refobjid = C.attrelid
            AND D.refobjsubid = C.attnum
            AND T.relname = PGT.tablename
        ORDER BY S.relname;
        """
    )
    statements = cur.fetchall()
    for s in statements:
        cur.execute(s[0])


def fix_db_sequences_ownership():
    cur = connection.cursor()
    cur.execute(
        """
        SELECT 'ALTER SEQUENCE '|| quote_ident(MIN(schema_name)) ||'.'|| quote_ident(MIN(seq_name))
               ||' OWNED BY '|| quote_ident(MIN(TABLE_NAME)) ||'.'|| quote_ident(MIN(column_name)) ||';'
        FROM (
            SELECT
                n.nspname AS schema_name,
                c.relname AS TABLE_NAME,
                a.attname AS column_name,
                SUBSTRING(d.adsrc FROM E'^nextval\\(''([^'']*)''(?:::text|::regclass)?\\)') AS seq_name
            FROM pg_class c
            JOIN pg_attribute a ON (c.oid=a.attrelid)
            JOIN pg_attrdef d ON (a.attrelid=d.adrelid AND a.attnum=d.adnum)
            JOIN pg_namespace n ON (c.relnamespace=n.oid)
            WHERE has_schema_privilege(n.oid,'USAGE')
              AND n.nspname NOT LIKE 'pg!_%' escape '!'
              AND has_table_privilege(c.oid,'SELECT')
              AND (NOT a.attisdropped)
              AND d.adsrc ~ '^nextval'
        ) seq
        GROUP BY seq_name HAVING COUNT(*)=1;
        """
    )
    statements = cur.fetchall()
    for s in statements:
        cur.execute(s[0])
