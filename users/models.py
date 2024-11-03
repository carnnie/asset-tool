# from django.contrib.auth.models import AbstractUser
# from django.db import models


# class ToolUser(AbstractUser):
#     username  = models.CharField(unique=True, blank=False, null=False, max_length=32)
#     email  = models.CharField(unique=True, blank=False, null=False, max_length=32)
#     roles  = models.ManyToManyField(to='Role')
#     store_role  = models.ManyToManyField(to='Store')
#     # USERNAME_FIELD = 'email'

#     def __str__(self) -> str:
#        return str(self.username)
    
#     def _as_dict(self) -> dict:
#         pass


# class Role(models.Model):
#     name = models.CharField(unique=True, blank=False, null=False, max_length=32)

# class Store(models.Model): 
#     name = models.CharField(unique=True, blank=False, null=False, max_length=32)