from enum import unique
from django.db import models

# Create your models here.
class Store(models.Model):
    """Model definition for Store."""

    # TODO: Define fields here
    idam = models.CharField(max_length=4, unique=True, blank=False, null=False)
    insight_id = models.IntegerField(unique=True, blank=False, null=False)
    insight = models.CharField(max_length=4, unique=True, blank=False, null=False)
    jira = models.CharField(max_length=32, unique=True, blank=False, null=False)

    class Meta:
        """Meta definition for Store."""

        verbose_name = 'Store'
        verbose_name_plural = 'Stores'

    def __str__(self):
        """Unicode representation of Store."""
        pass


