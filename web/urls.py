# coding: utf-8

from django.conf.urls import url, include
from account.views import SignupView, LoginView, LogoutView, DeleteView
from account.views import ConfirmEmailView
from account.views import ChangePasswordView, PasswordResetView, PasswordResetTokenView
from account.views import SettingsView

from web.views import home, SignupView


urlpatterns = [
    url(r"^$", home, name="home"),
    # Rewrite account urls
    url(r"^account/signup/$", SignupView.as_view(), name="account_signup"),
    url(r"^account/login/$", LoginView.as_view(), name="account_login"),
    url(r"^account/logout/$", LogoutView.as_view(), name="account_logout"),
    url(r"^account/confirm_email/(?P<key>\w+)/$", ConfirmEmailView.as_view(), name="account_confirm_email"),
    url(r"^account/settings/$", SettingsView.as_view(), name="account_settings"),
    url(r"^account/settings/password/$", ChangePasswordView.as_view(), name="account_password"),
    url(r"^account/settings/password/reset/$", PasswordResetView.as_view(), name="account_password_reset"),
    url(r"^account/settings/password/reset/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$", PasswordResetTokenView.as_view(), name="account_password_reset_token"),
    url(r"^account/settings/delete/$", DeleteView.as_view(), name="account_delete"),
]
