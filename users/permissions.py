from django.shortcuts import redirect
from rest_framework.permissions import BasePermission

# from users.IDAM import User


# Permission classe for API
class ITPermission(BasePermission):
    message = "IT roles only"
    roles = {
        "MCC_RU_INSIGHT_IT_ROLE",
    }

    def has_permission(self, request, view) -> bool:
        user = request.session.get("user", False)
        return bool(user) and bool([role for role in user["roles"] if role in self.roles])
    
    @classmethod
    def is_user_it(cls, user):
        '''Для проверки роли пользователя на IT роли внтри вьюх'''
        return any([role in user['roles'] for role in cls.roles])


class UserPermission(BasePermission):
    message = "With store assigned only"

    def has_permission(self, request, view):
        user = request.session.get("user", False)
        return bool(user) and bool([role for role in user["store_role"]])


#  Methods mixins for standart views
class IsUserMixin:
    def dispatch(self, request, *args, **kwargs):
        if user := request.session.get("user", False):
            if user["store_role"] or user["roles"]:
                return super().dispatch(request, *args, **kwargs)
        return redirect('/')


class IsITMixin:
    roles = {
        "MCC_RU_INSIGHT_IT_ROLE",
    }

    def dispatch(self, request, *args, **kwargs):
        if user := request.session.get("user", False):
            if set(user["roles"]) & self.roles:
                return super().dispatch(request, *args, **kwargs)
        return redirect('/')


class IsInventAdminAdminMixin:
    def dispatch(self, request):
        roles = {}
        if user := request.session.get("user", False):
            return bool(set(user["roles"]) & roles)
        return redirect('/')
