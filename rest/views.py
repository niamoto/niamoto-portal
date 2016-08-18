# coding: utf-8

from django.contrib.auth.models import User, Group
from rest_framework import viewsets

from rest.serializers import UserSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving niamoto's users.
    """
    base_name = 'user'
    serializer_class = UserSerializer
    pagination_class = None

    def get_queryset(self):
        only_team = self.request.query_params.get('only_team', None)
        if only_team:
            group = Group.objects.get(name='team')
            return group.user_set.all()
        return User.objects.filter(is_active=True)
