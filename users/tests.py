from django.test import TestCase

from users.IDAM import User


# Create your tests here.
class TestUserClass(TestCase):
    def setUp(self):
        self.client.session["user"] = User()


class TestPermissions(TestCase):
    pass
