import os

import requests
import logging
import jwt
from django.http import HttpResponse
from django.shortcuts import redirect
from base64 import b64decode

from core import settings
from core.settings import IDAM_CLIENT_ID,IDAM_CLIENT_SECRET, DEBUG


from django.urls import reverse


logger = logging.getLogger('main')


class IDAMAuthMixin:
    def dispatch(self, request, *args, **kwargs):
        if "user" not in request.session and settings.DEBUG:
            user_info = {
                "email": "ilya.pashutin@metro-cc.ru",
                "aud": 12345,
                "usertype": "M_INSIGHT",
                "username": "ilya.pashutin",
                "store_role": ["1010", "1094"],
                "insight_id": "AUT-276543",     # Pashutin, Ilya
                "MCC_RU_INSIGHT_ACCOUNTANT_ROLE": True,
                "roles": ['IT', 'accountant', 'inventadmin'],
                "it_role": True
            }
            request.session["user"] = user_info

        code = request.GET.get("code", "")

        if "user" not in request.session and not code: 
            return redirect(IDAM.code_url())

        elif code and "user" not in request.session:
            token = IDAM.get_token_with_code(code)
            user = IDAM.get_user_from_token(token)
            request.session["user"] = user
            if self.allowed(user):
                return redirect(reverse("index"))

        # сессия заведена, код удален
        elif not self.allowed(request.session['user']):
            return redirect(reverse("401"))

        return super().dispatch(request, *args, **kwargs)

    def allowed(self, user) -> bool:
        return user['store_role'] or user["roles"]


class IDAM:
    url = "https://idam.metrosystems.net"

    client_id = IDAM_CLIENT_ID
    client_secret = IDAM_CLIENT_SECRET
    data: dict = {
        "redirect_uri": "https://asset-tool.metro-cc.ru",  # проблема с "realm_id": "M_INSIGHT",
        "client_id": client_id,
        "user_type": "EMP",
    }

    @classmethod  # Python 3.10+
    def code_url(cls, **kwargs) -> str:
        """В кваргах можно сообщить дополнительные переменные для запроса"""
        cls.env_check()
        data: dict = {
            "response_type": "code",
            **cls.data,
            **kwargs,
        }
        params = [f"{key}={value}" for key, value in data.items()]
        return f"{cls.url}/authorize/api/oauth2/authorize?{'&'.join(params)}"

    @classmethod
    def get_token_with_code(cls, code: str, **kwargs) -> str | HttpResponse:
        cls.env_check()
        url: str = f"{cls.url}/authorize/api/oauth2/access_token"
        data: dict = {
            "grant_type": "authorization_code",
            "code": code,
            **cls.data,
            **kwargs,
        }
        response = requests.post(
            url=url,
            auth=requests.auth.HTTPBasicAuth(cls.client_id, cls.client_secret),
            data=data,
            json=data,
        )
        try:
            return response.json().get("access_token")
        except KeyError:
            # logging

            return {"error": f"Ошибка расшифровки IDAM токена в {cls.__name__}"}


    @classmethod
    def get_token_with_password(cls, username: str, password, **kwargs) -> str:
        """не тестировал"""
        cls.env_check()
        url: str = f"{cls.url}/authorize/api/oauth2/access_token"
        data: dict = {
            "grant_type": "password",
            "username": b64decode(username),
            "password": b64decode(password),
            **cls.data,
            **kwargs,
        }
        response = requests.post(
            url=url,
            auth=requests.auth.HTTPBasicAuth(cls.client_id, cls.client_secret),
            data=data,
        )

        return response.json()["access_token"]

    @classmethod
    def decode_token(cls, token: str) -> dict:
        token_data = jwt.decode(token, algorithms="HS256", options={"verify_signature": False})
        return token_data

    # @classmethod
    # def form_user_data(cls, token_data: dict) -> dict:
    #     return {}

    @classmethod
    def env_check(cls):
        if cls.client_id is None or cls.client_secret is None:
            raise EnvironmentError(
                f"В классе {cls.__name__ } не найденны переменные среды. client_id={cls.client_id}, client_secret"
            )

    @classmethod
    def form_token_data(cls, decoded_token: dict) -> dict:
        """Извлечение нужных данных из токена"""

        USED_ROLES = {"MCC_RU_INSIGHT_ACCOUNTANT_ROLE", 
                      "MCC_RU_INSIGHT_IT_INVENTADMIN_ROLE", 
                      "MCC_RU_INSIGHT_IT_ROLE",}

        user_info = {
            "email": decoded_token["email"],
            "username": decoded_token["email"].split("@")[0],
            "store_role": [],
            "roles": [], 
        }

        if decoded_token["authorization"]:
            for role in decoded_token["authorization"]:
                user_info["roles"].extend(set(role.keys()) & USED_ROLES)

                if "MCC_RU_INSIGHT_IT_ROLE" in role:
                    user_info["roles"].append("IT")
                # check store role
                if "MCC_RU_INSIGHT_STORE_ROLE" in role:
                    for store in role["MCC_RU_INSIGHT_STORE_ROLE"][0]["store"]:
                        if str(store) == '9999':
                            user_info["store_role"].append("8001")
                        elif len(store) == 3:
                            user_info["store_role"].append("1" + store)
                        else:
                            user_info["store_role"].append("10" + store)

                if "MCC_RU_INSIGHT_ACCOUNTANT_ROLE" in role:
                    user_info["roles"].append("accountant")
                if "MCC_RU_INSIGHT_IT_INVENTADMIN_ROLE" in role:
                    user_info["roles"].append("inventadmin")


        logger.warning(user_info["roles"])
        return user_info

    @classmethod
    def get_user_from_token(cls, token: str) -> dict:
        decoded_token = cls.decode_token(token)
        return cls.form_token_data(decoded_token)


