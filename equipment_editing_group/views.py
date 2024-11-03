import logging
from django.shortcuts import render
from django.views.generic import TemplateView

from logic.MARS import mars_insight
from rest_framework.response import Response
from rest_framework.views import APIView
from users.IDAM import IDAMAuthMixin, get_user_id
from users.permissions import IsUserMixin


logger = logging.getLogger("group_edit")


class MainView(IDAMAuthMixin, IsUserMixin, TemplateView):
    template_name = "index.html"

    def get(self, request):
        return render(request, self.template_name)


class SearchView(APIView):
    def post(self, request):
        description = request.data.get("Description")
        inv_nums = request.data.get("Inv No")
        serial_nums = request.data.get("Serial No")

        iql = " AND ".join(
            f'"{key}" = "{value}"'
            for key, value in request.data.items()
            if value and key not in ["Serial No", "Inv No", "Description"]
        )

        if description:
            if iql:
                iql += f" AND "
            iql += f'"Description" LIKE "{description}"'

        if inv_nums or serial_nums:
            if iql:
                iql += f" AND "
            if inv_nums:
                iql += f'"INV No" IN ({inv_nums})'
            else:
                iql += f'"Serial No" IN ({serial_nums})'

        logger.warning(f"Попытка поиска оборудования по iql: {iql}")
        items = mars_insight.search(item_type="Hardware", iql=iql, order_field="Name")
        logger.warning("Оборудование найдено.")

        return Response({"result": items})


class EditView(APIView):
    def post(self, request):
        attrs = {"HWUserUpdate": get_user_id(session=request.session, logger=logger)}
        items = request.data.get("items", "")

        for key, value in request.data.items():
            if key not in ["items", "add", "rewrite"] and value:
                attrs[key] = value
            elif key == "rewrite":
                attrs["Description"] = value

        logger.warning(
            f"Попытка отредактировать оборудования с id: {', '.join(map(lambda item: item['Key'], items))}"
        )

        for item in items:
            if request.data.get("add"):
                attrs["Description"] = item["Description"] + request.data.get("add")
            mars_insight.set(item_type="Hardware", id=item["Key"], attrs=attrs)

        logger.warning("Оборудование отредактировано.")

        return Response({"result": 123})
