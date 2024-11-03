import logging
from django.shortcuts import render
from django.views.generic import TemplateView
import requests

from logic.MARS import mars_insight
from rest_framework.response import Response
from rest_framework.views import APIView
from users.IDAM import IDAMAuthMixin, get_user_id
from users.permissions import IsUserMixin

import json


logger = logging.getLogger("single_edit")


class MainView(IDAMAuthMixin, IsUserMixin, TemplateView):
    template_name = "index.html"

    def get(self, request):
        return render(request, self.template_name)


class EditView(APIView):
    def post(self, request):
        obj_key = ""
        attrs = {"HWUserUpdate": get_user_id(request.session, logger=logger)}
        for key, value in request.data.items():
            if key == "obj_key":
                obj_key = value
            elif value == "undefined":
                attrs[key] = ""
            else:
                attrs[key] = value

        logger.warning(f"Попытка отредактировать оборудования с id {obj_key}...")
        mars_insight.set(id=obj_key, attrs=attrs, item_type="Hardware")
        logger.warning("Оборудование отредактировано.")

        return Response({"result": "done"})


class PrintersView(APIView):
    def get(self, request):
        printers = []
        response = requests.get("https://asset-tool.metro-cc.ru/api/printer/run/?mask=Invent_IT")
        if response.status_code == 200:
            printers = response.json().values()

        logger.warning('Список принтеров получен.')

        return Response({"result": printers})


class PrintView(APIView):
    def post(self, request):
        printer = request.data.get("printer", "")
        obj_data = request.data.get("item", "")

        if printer:
            response = requests.post(
                url="https://asset-tool.metro-cc.ru/api/printlabel/run/smart/",
                json=json.dumps(
                    {
                        "data": obj_data,
                        "PrinterName": printer.get("label", ""),
                        "LabelType": "Linear",
                        "ip": printer.get("ip", ""),
                    }
                ),
            )
            logger.warning(f'Этикетка распечатана.')

            return Response({"result": response.status_code})
        
        return Response({"result": 500})
