from django.db import models
import datetime
# Create your models here.


def current_year():
    return datetime.date.today().year


def year_choicies(year_fisrt):
    return [(r, r) for r in range(year_fisrt, datetime.date.today().year+1)]


class Ressource(models.Model):
    """Model definition for Ressource."""

    SUPPORT = (
        ('publication', 'publication'),
        ('book', 'livre'),
        ('report', 'rapport'),
        ('article', 'article'),
        ('conference', 'conférence'),
        ('film', 'film'),
        ('radio', 'radio')
    )

    support = models.CharField(
        max_length=50, choices=SUPPORT, default='publication')
    who = models.CharField(null=True, blank=True, max_length=400)
    description = models.CharField(null=True, blank=True, max_length=400)
    journal = models.CharField(null=True, blank=True, max_length=250)
    issue = models.CharField(null=True, blank=True, max_length=4)
    pages = models.CharField(null=True, blank=True, max_length=12)
    year = models.IntegerField(
        null=True, blank=True, choices=year_choicies(2012), default=current_year())
    link = models.URLField(null=True, blank=True, max_length=200)

    class Meta:
        """Meta definition for Ressource."""

        verbose_name = 'Ressource'
        verbose_name_plural = 'Ressources'

    def __str__(self):
        """Unicode representation of Ressource."""
        return self.support


class Person(models.Model):
    """Model definition for Person"""

    first_name = models.CharField(null=True, blank=True, max_length=50)
    last_name = models.CharField(null=True, blank=True, max_length=50)
    image = models.ImageField(null=True, blank=True, upload_to='persons',
                              height_field=None, width_field=None, max_length=None)

    class Meta:
        """Meta definition for Person"""

        verbose_name = 'Person'
        verbose_name_plural = 'Persons'

    def __str__(self):
        """Unicode representation of Person"""
        return self.first_name + ' ' + self.last_name


class Activity(models.Model):
    """Model definition for acivity."""

    MONTH = (
        (1, 'janvier'),
        (2, 'février'),
        (3, 'mars'),
        (4, 'avril'),
        (5, 'mai'),
        (6, 'juin'),
        (7, 'juillet'),
        (8, 'aout'),
        (9, 'septembre'),
        (10, 'octobre'),
        (11, 'novembre'),
        (12, 'décembre')
    )

    person = models.ForeignKey(
        Person, related_name='activities', on_delete=models.DO_NOTHING)
    contrat = models.CharField(max_length=50)
    first_year = models.IntegerField(
        null=True, blank=True, choices=year_choicies(2010), default=current_year())
    first_month = models.IntegerField(null=True, blank=True, choices=MONTH)
    last_year = models.IntegerField(
        null=True, blank=True, choices=year_choicies(2010), default=current_year())
    last_month = models.IntegerField(null=True, blank=True, choices=MONTH)
    title = models.CharField(null=True, blank=True,
                             max_length=210, default='.')
    comment = models.CharField(null=True, blank=True, max_length=100)
    description = models.CharField(null=True, blank=True, max_length=850)
    link = models.URLField(null=True, blank=True, max_length=200)

    class Meta:
        """Meta definition for acivity."""

        verbose_name = 'acivity'
        verbose_name_plural = 'activities'

    def __str__(self):
        """Unicode representation of acivity."""
        return self.contrat + ': ' + self.title
