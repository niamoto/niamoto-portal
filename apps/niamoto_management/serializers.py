# coding: utf-8

from rest_framework import serializers
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    """

    full_name = serializers.SerializerMethodField()

    def get_full_name(self, instance):
        return instance.get_full_name()

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'full_name',
        )
