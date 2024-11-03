from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_401_UNAUTHORIZED
from rest_framework.views import APIView

from django.shortcuts import redirect

import logging
logger = logging.getLogger('main')


# Create your views here.
class WhoAmIView(APIView):
    http_method_names = ["post", "get"]

    def get(self, request):
        if user := request.session.get("user", False):
            return Response(data=user, status=HTTP_200_OK)
        return Response(data={}, status=HTTP_401_UNAUTHORIZED)

    def post(self, request):
        if user := request.session.get("user", False):
            return Response(data=user, status=HTTP_200_OK)
        return Response(data={}, status=HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    http_method_names = ["get"]

    def get(self, request):
        if request.session.get("user", False):
            request.session.pop("user")
            return redirect("/")
        return Response(data={}, status=HTTP_401_UNAUTHORIZED)


