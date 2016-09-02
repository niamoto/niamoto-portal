# coding: utf-8

from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from apps.niamoto_management.serializers import UserSerializer
from apps.niamoto_management.tasks import backup_db


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving niamoto's users.
    """
    base_name = 'user'
    serializer_class = UserSerializer
    pagination_class = None
    permission_classes = (IsAdminUser, )

    def get_queryset(self):
        only_team = self.request.query_params.get('only_team', None)
        if only_team:
            group = Group.objects.get(name='team')
            return group.user_set.all()
        return User.objects.filter(is_active=True)


@login_required()
@api_view(['GET'])
@permission_classes((IsAdminUser, ))
def trigger_backup(request):
    backup_db.s().apply_async()
    return Response({"message": "Database backup triggered"})
