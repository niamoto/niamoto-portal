# coding: utf-8

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.niamoto_management.tasks import backup_db


@login_required()
@api_view(['GET'])
def trigger_backup(request):
    backup_db.s().apply_async()
    return Response({"message": "Database backup triggered"})
