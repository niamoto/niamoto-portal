# coding: utf-8

from django.http import Http404
from revproxy.views import ProxyView


class AuthProxyView(ProxyView):

    def dispatch(self, request, path):
        if request.user.is_staff:
            return super(AuthProxyView, self).dispatch(request, path)
        raise Http404()
