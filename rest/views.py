# coding: utf-8

from django.contrib.auth.models import User
from rest_framework import viewsets

from rest.serializers import UserSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving niamoto's users.
    """
    base_name = 'user'
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
