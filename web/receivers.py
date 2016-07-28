# coding: utf-8

from django.conf import settings
from django.dispatch import receiver
from django.core.mail import send_mail
from account.signals import user_signed_up

from utils import get_default_from_email, get_email_backend


@receiver(user_signed_up)
def handle_user_signed_up(sender, **kwargs):
    user = kwargs.get("user")
    msg = "L'utilisateur {} s'est inscrit sur numberone:\n"\
        + "Nom: {}\nPrénom: {}\nEmail: {}.\nBourre-le!"
    msg = msg.format(
        user.username,
        user.last_name,
        user.first_name,
        user.email
    )
    subject = "L'enculé, y'a un nouvel inscrit sur numberone!"
    send_mail(
        subject,
        msg,
        get_default_from_email(),
        settings.ADMINS,
        connection=get_email_backend()
    )
