# coding: utf-8

from django.contrib.auth import get_user_model
import account.views

from web.forms import SignupForm


class SignupView(account.views.SignupView):
    """
    Class-based view for signup, overriding the one from account app.
    """

    form_class = SignupForm

    def create_user(self, form, commit=True, model=None, **kwargs):
        """
        Overrride create_user method to include first and last names.
        """
        User = model
        if User is None:
            User = get_user_model()
        user = User(**kwargs)
        username = form.cleaned_data.get("username")
        if username is None:
            username = self.generate_username(form)
        user.username = username
        user.email = form.cleaned_data["email"].strip()
        password = form.cleaned_data.get("password")
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.first_name = form.cleaned_data.get('first_name')
        user.last_name = form.cleaned_data.get('last_name')
        if commit:
            user.save()
        return user
