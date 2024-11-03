import logging
from typing import Any, Literal
import jwt
import requests
from django.shortcuts import redirect

from logic.MARS import mars_insight

from core.settings import IDAM_CLIENT_ID, IDAM_CLIENT_SECRET


class IDAMAuthMixin:
    """Main auth mixin must be run first of all mixins"""

    def dispatch(self, request, *args, **kwargs):
        if request.session.get("user", None):
            return super().dispatch(request, *args, **kwargs)
        elif code := request.GET.get("code", None):
            token = IDAM.get_token_with_code(code)
            request.session["user"] = IDAM.form_user_data(token)
            url = request.session.pop("redirect")
            return redirect(url)
        else:
            request.session["redirect"] = (
                request.get_full_path()
            )  # This session param help us redirect back to current page
            return redirect(IDAM.code_url())


class IDAM:
    ROLES = {
        "MCC_RU_INSIGHT_IT_ROLE",
        "MCC_RU_INSIGHT_IT_INVENTADMIN_ROLE",
        "MCC_RU_INSIGHT_ACCOUNTANT",
        "MCC_RU_INSIGHT_QA_ROLE",
        "MCC_RU_INSIGHT_ACCOUNTANT_ROLE",
        "MCC_RU_INSIGHT_IT_STORAGE_ROLE",
    }

    url = "https://idam.metrosystems.net"
    __client_id = IDAM_CLIENT_ID
    __client_secret = IDAM_CLIENT_SECRET
    data: dict = {
        "redirect_uri": "https://asset-tool.metro-cc.ru",  # проблема с "realm_id": "M_INSIGHT",
        "client_id": __client_id,
        "user_type": "EMP",
    }

    @classmethod
    def code_url(cls, **kwargs) -> str:
        data = {"response_type": "code", **cls.data, **kwargs}
        params = [f"{key}={value}" for key, value in data.items()]
        return f"{cls.url}/authorize/api/oauth2/authorize?{'&'.join(params)}"

    @classmethod
    def get_token_with_code(cls, code, **kwargs):
        url = f"{cls.url}/authorize/api/oauth2/access_token"
        data = {"grant_type": "authorization_code", "code": code, **cls.data, **kwargs}
        response = requests.post(
            url=url, auth=requests.auth.HTTPBasicAuth(cls.__client_id, cls.__client_secret), data=data
        )
        if token := response.json().get("access_token", None):
            return token

    @classmethod
    def decode_token(cls, token: str) -> dict:
        return jwt.decode(token, algorithms="HS256", options={"verify_signature": False})

    @classmethod
    def form_user_data(cls, token) -> dict:
        data = cls.decode_token(token)
        with open("1.txt", "w") as f:
            import pprint

            pprint.pprint(data, f)

        user_insight = mars_insight.search(iql=f'"Email" = {data["email"]}', item_type="AD_User") or [{}]
        user = dict(
            username=data["email"].split("@")[0],
            email=data["email"],
            roles=[],
            store_role=[],
            insight_id=user_insight[0].get("id", ""),
        )
        for role in data.get("authorization", {}):
            user["roles"].extend(set(role.keys()) & cls.ROLES)

            # get stores from token
            if "MCC_RU_INSIGHT_STORE_ROLE" in role:
                user["store_role"] = cls.get_user_stores(role["MCC_RU_INSIGHT_STORE_ROLE"])
        if user["store_role"]:
            user["roles"].append("MCC_RU_INSIGHT_STORE_ROLE")
        return user

    @classmethod
    def get_user_stores(cls, stor_role):
        stores = []
        for store in stor_role[0]["store"]:
            if str(store) == "9999":
                stores.append("8001")
            elif len(store) == 3:
                stores.append("1" + store)
            else:
                stores.append("10" + store)
        return stores


def get_user_id(session: dict[str, Any], logger: logging.Logger) -> str:
    '''Получение id юзера из сессии'''
    if user_dict := session.get("user"):
        user_id = user_dict.get("insight_id", "")
        if not user_id:
            logger.warning(f"Отсутствует id у пользователя {user_dict['username']}")
        return user_id
    logger.warning(f"Пользователь отсутствует в сессии")
    return ""
