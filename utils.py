# coding: utf-8

from collections import OrderedDict

from django.core.mail.backends.smtp import EmailBackend


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
