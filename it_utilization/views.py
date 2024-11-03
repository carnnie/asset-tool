import csv
from datetime import datetime
from io import TextIOWrapper
import io
import json
import logging
import os
import re
from django.shortcuts import render
from django.views.generic import TemplateView
import pandas
import requests

from logic.send_mail import send_mail
from logic.MARS import mars_insight
from rest_framework.response import Response
from rest_framework.views import APIView
from users.IDAM import IDAMAuthMixin
from users.permissions import IsUserMixin

logger = logging.getLogger("main")

class MainView(IDAMAuthMixin, IsUserMixin, TemplateView):
    template_name = "index.html"

    def get(self, request):
        return render(request, self.template_name)


class HandleSAPReport(APIView):
    def post(self, request, *args, **kwargs):
        file = TextIOWrapper(request.data.get("file", ""), encoding="utf-8")
        store = request.data.get("store", "")
        pallets = request.data.get("pallets", "")

        if file and store and pallets:
            result = []

            pallets = json.loads(pallets)
            iql_pallets = ", ".join(map(lambda p: f'"{p}"', pallets))
            iql = f'"Pallet"."Store" = "{store}" AND "Pallet"."Name" IN ({iql_pallets}) AND "Pallet"."State" In ("To Discard")'

            insight_objs = mars_insight.search(item_type="Hardware", iql=iql, order_field="Type")
            insight_objs.sort(key=lambda obj: (obj["Type"], obj["Model"]))  # через iql только по одному полю

            sap_csv = list(enumerate(csv.reader(file, delimiter=";"), start=1))

            for i, obj in enumerate(insight_objs, start=1):
                device = {
                    "id": i,
                    "ТЦ": obj.get("Store", ""),
                    "Серийный номер": obj.get("Serial No", ""),
                    "Тип (англ)": obj.get("Type", ""),
                    "Модель": obj.get("Model", ""),
                    "Тип (рус)": obj.get("Type RUS", ""),
                    "Инвентарный номер": obj.get("INV No", ""),
                    "Количество": 1,
                    "Номер SAP": "",
                    "Название ОС": "",
                    "Дата списания ОС": "",
                    "errors": {"inv_in_several_rows": False, "different_invs_in_same_row": False},
                    "rows": [],
                }

                for j, row in sap_csv:
                    sap_no = row[1]
                    sap_inv1 = row[3]
                    sap_inv2 = row[4]
                    sap_fa_name = row[7]
                    sap_disposal_date = row[9]

                    if device.get("Инвентарный номер", "") in [sap_inv1, sap_inv2]:
                        if device["rows"]:
                            device["errors"]["inv_in_several_rows"] = True
                            device["Номер SAP"] = ""
                            device["Название ОС"] = ""
                            device["Дата списания ОС"] = ""
                            device["rows"].append(j)
                            break
                        if sap_inv1 != sap_inv2 and sap_inv1 and sap_inv2:
                            device["errors"]["different_invs_in_same_row"] = True

                        if sap_disposal_date == "00000000":
                            device["Номер SAP"] = sap_no
                            device["Дата списания ОС"] = ""
                        else:
                            device["Номер SAP"] = "МБП"
                            device["Дата списания ОС"] = sap_disposal_date

                        device["Название ОС"] = sap_fa_name
                        device["rows"].append(j)

                if not device.get("Номер SAP", ""):
                    device["Номер SAP"] = "МБП"

                result.append(device)

            return Response({"result": result})
        return Response({"result": "123"})


class SendResult(APIView):
    def post(self, request, *args, **kwargs):
        table = []
        store = request.data.get("store", "")
        wave = request.data.get("wave", "")
        filename = f'{store}_Util_{datetime.now().strftime("%Y-%m-%d")}.xlsx'

        if wave:
            msg_subject = f"{store} Утилизация IT-оборудования {wave}"
        else:
            msg_subject = f"{store} Утилизация IT-оборудования {datetime.now().strftime("%Y_%m")}"
        
        logger.warning(f"IT_UTILIZATION: {msg_subject}")

        fields = ["Тип (англ)", "Модель", "Тип (рус)", "Инвентарный номер", "Номер SAP", "Количество"]

        for d in request.data.get("rows", ""):
            row = {}
            for key, value in d.items():
                if key == "id":
                    row["№ п/п"] = value
                elif key in fields:
                    row[key] = value
            table.append(row)

        df = pandas.DataFrame.from_dict(table)
        writer = pandas.ExcelWriter(filename, engine="xlsxwriter")
        df.to_excel(writer, index=False)

        worksheet = writer.sheets["Sheet1"]
        worksheet.set_column(1, 6, 30)
        writer.close()

        send_mail(
            From=request.session.get("email", ""),
            To=["12345@mail.ru"],
            subject=msg_subject,
            html=f"""Добрый день.<br/><br/>
                    Планируется очередной вывоз IT-оборудование для утилизации со склада {store} <br>
                    Просьба проверить со своей стороны список перед финальным формированием Акта приёма-передачи 
                    который будет отправлен утилизационной компании на подписание.<br>
                    Если возникнут вопросы, готов на них ответить.""",
            files=[filename],
        )

        os.remove(filename)

        return Response({"result": "123"})
