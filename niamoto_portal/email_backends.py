# coding: utf-8

import threading

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend
from django.core.mail.backends.smtp import EmailBackend


class DynamicEmailBackend(EmailBackend):
    """
    Email backend looking for configuration in constance dynamic config
    instead of static settings.
    """

    def __init__(self, fail_silently=False, use_ssl=None, timeout=None,
                 ssl_keyfile=None, ssl_certfile=None, **kwargs):
        BaseEmailBackend.__init__(self, fail_silently=fail_silently)
        self.use_ssl = settings.EMAIL_USE_SSL if use_ssl is None else use_ssl
        self.timeout = settings.EMAIL_TIMEOUT if timeout is None else timeout
        self.ssl_keyfile = settings.EMAIL_SSL_KEYFILE if ssl_keyfile is None else ssl_keyfile
        self.ssl_certfile = settings.EMAIL_SSL_CERTFILE if ssl_certfile is None else ssl_certfile
        if self.use_ssl and self.use_tls:
            raise ValueError(
                "EMAIL_USE_TLS/EMAIL_USE_SSL are mutually exclusive, so only set "
                "one of those settings to True.")
        self.connection = None
        self._lock = threading.RLock()

    @property
    def host(self):
        from constance import config
        return config.EMAIL_HOST

    @property
    def port(self):
        from constance import config
        return config.EMAIL_PORT

    @property
    def username(self):
        from constance import config
        return config.EMAIL_HOST_USER

    @property
    def password(self):
        from constance import config
        return config.EMAIL_HOST_PASSWORD

    @property
    def use_tls(self):
        from constance import config
        return config.EMAIL_USE_TLS
