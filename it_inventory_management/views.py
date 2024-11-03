import datetime
import logging

from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.views import APIView
from rest_framework.response import Response
from logic.MARS import mars_insight
from users.IDAM import IDAMAuthMixin, get_user_id
from users.permissions import IsUserMixin


logger = logging.getLogger("it_invent_mng")


class MainView(IDAMAuthMixin, IsUserMixin, TemplateView):
    template_name = "index.html"

    def get(self, request):
        return render(request, self.template_name)


class OpenInventory(APIView):
    def post(self, request):
        store_num: str = request.data.get("store_num", "")
        store_key: str = request.data.get("store_key", "")

        cur_date = datetime.date.today()
        cur_user = get_user_id(request.session, logger=logger)
        cur_user = "AUT-276543"  # мой id для отладки

        fields = {
            "InventoryID": f'{store_num}_{cur_date.strftime("%Y-%m-%d")}',
            "InventoryStore": store_key,
            "InventoryStatus": 390867,  # Open
            "InventoryOpen": datetime.date.today().strftime("%d/%m/%Y"),
            "InventoryUserCreate": cur_user,
        }

        logger.warning(f"Попытка открыть инвентаризацию по тц {store_num}...")
        mars_insight.create(item_type="Inventory_IT", attrs=fields)
        logger.warning(f"Инвентаризация по тц {store_num} открыта.")

        return Response({"result": "done"})


class CancelInventory(APIView):
    def post(self, request):
        inv_id = request.data.get("inv_id", "")
        cur_date = datetime.date.today()
        cur_user = get_user_id(request.session, logger=logger)
        cur_user = "AUT-276543"  # мой id для отладки

        fields = {
            "InventoryStatus": 390869,  # Cancelled
            "InventoryClose": f"{cur_date.day}/{cur_date.month}/{str(cur_date.year)[-2:]}",
            "InventoryUserClose": cur_user,
        }

        logger.warning(f"Попытка отменить инвентаризацию с id {inv_id}...")
        mars_insight.set(item_type="Inventory_IT", id=inv_id, attrs=fields)
        logger.warning(f"Инвентаризация с id {inv_id} отменена.")

        return Response({"result": "done"})


class CloseInventory(APIView):
    def post(self, request):
        store_num = request.data.get("store_num", "")
        inv_name = request.data.get("inv_name", "")
        inv_id = request.data.get("inv_id", "")

        cur_date = datetime.date.today().strftime("%d/%m/%Y")
        cur_user = get_user_id(request.session, logger=logger)
        cur_user = "AUT-276543"  # мой id для отладки

        iql = f'Store = {store_num} AND object NOT HAVING inboundReferences(Inventory = "{inv_name}")'
        hardware = mars_insight.search(item_type="Hardware", iql=iql)

        logger.warning(f"Попытка закрыть инвентаризацию по тц {store_num}...")
        logger.warning(f"Количество неучтенного оборудования: {len(hardware)}")

        for obj in hardware:
            mars_insight.set(
                id=obj["id"],
                item_type="Hardware",
                attrs={
                    "State": 127380,
                    "Location": 107918,
                    "HWUserUpdate": cur_user,
                },  # Wanted  # WANTED!!! 381524
            )

            mars_insight.create(
                item_type="InventoryCard",
                attrs={
                    "Name": f"{obj['INV No']}_{obj['Type']}_{obj['Model']}",
                    "Inventory": inv_id,
                    "INV No": obj["id"],
                    "Дата инвентаризации": cur_date,
                    "UserInventory": cur_user,
                    "Deficit": True,
                },
            )

        mars_insight.set(
            id=inv_id,
            item_type="Inventory_IT",
            attrs={
                "InventoryStatus": 390868,  # Closed
                "InventoryClose": cur_date,
                "InventoryUserClose": cur_user,
            },
        )

        logger.warning(f"Инвентаризация по тц {store_num} закрыта.")

        return Response({"result": "done"})
