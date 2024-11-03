import asyncio
import logging
import mimetypes
import os
from uuid import uuid4

import datetime
import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import pandas
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.views.generic import TemplateView, View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView

from logic.IDAM import IDAMAuthMixin
from logic.MARS import mars_insight
from it_invent.mail_data import get_mail_text
# Create your views here.

logger = logging.getLogger("main")


class MainView(IDAMAuthMixin, TemplateView):
    template_name = "index.html"

    def get(self, request):
        user = request.session["user"]
        if "MCC_RU_INSIGHT_IT_ROLE" in user["roles"]:
            context = {"title": "IT Invent"}
            context["items"] = mars_insight.search(
                iql='"InventoryStatus" = Open',
                item_type="Inventory_IT",
                results=200,
                order_field="InventoryStore",
            )
            return render(request, self.template_name, context)
        return redirect("index")


class InventData(View):

    async def get(self, request):
        store = request.GET.get("store", "")
        inventory = request.GET.get("inventory", "")
        items = []
        if store and inventory:
            iql = f"objectType = Hardware AND Store = {store} And object HAVING inboundReferences(Inventory = {inventory})"
            iql_not = f"objectType = Hardware AND Store = {store} And object NOT HAVING inboundReferences(Inventory = {inventory})"
            invented, not_invented = await asyncio.gather(
                mars_insight.async_search(
                    iql=iql, item_type="Hardware", results=2000, deep=1
                ),
                mars_insight.async_search(
                    iql=iql_not, item_type="Hardware", results=2000, deep=1
                ),
            )
            for i in invented:
                i["Invented"] = "Yes"
            for i in not_invented:
                i["Invented"] = "No"
            items = invented + not_invented
        return JsonResponse({"items": items})


@method_decorator(csrf_exempt, name='dispatch')
class ToExcelView(APIView):
    iql = ""
    filename = "report.xlsx"

    def post(self, request):
        name = str(uuid4())
        filename = f"static/tmp/{name}.xlsx"
        data = request.data.get("items", "{}")
        fields = set(request.data.get("fields", []))
        df = pandas.json_normalize([{key: value for key, value in item.items() if key in fields} for item in data])
        df.to_excel(filename, index=False)
        with open(filename, "rb") as file:
            mime_type, _ = mimetypes.guess_type(filename)
            response = HttpResponse(file, content_type=mime_type)
            response["Content-Disposition"] = f'attachment; filename="{self.filename}"'
        os.remove(filename)
        return response


class DeleteEreqView(APIView):
    def post(self, request):
        id = request.POST["id"]
        invent = request.POST["invent"]
        user = request.session["user"]
        done = False
        # if invent and id:
        if user["MCC_RU_INSIGHT_IT_INVENTADMIN_ROLE"] and id and invent:
            item = mars_insight.search(
                iql=f'"Inventory" = {invent} AND "INV No" = {id}',
                item_type="InventoryCard",
                results=1,
            )
            if item:
                insight.delete(id=item[0]["id"])
                done = True
            logger.warning("Done")
        return Response({"ok": done})


class NotifyView(IDAMAuthMixin, TemplateView):
    template_name = "it_invent/notify.html"

    async def get(self, request):
        user = request.session["user"]
        if user["it_role"]:
            context = {"title": "IT Invent"}
            context["items"] = await mars_insight.async_search(
                iql='"InventoryStatus" = Open',
                item_type="Inventory_IT",
                results=200,
                order_field="InventoryStore",
            )
            return render(request, self.template_name, context)
        return redirect("index")


class NotifySendApi(APIView):
    def post(self, request):
        to = request.data.get("To", '')
        title = request.data.get("title", '')
        body = request.data.get("body", '')
        user = request.session.get('user', '')
        if to and title and body and user:
            msg = MIMEMultipart()
            msg['To'] = to
            msg["From"] = f'"{', '.join([word.capitalize() for word in user['username'].split('.')[::-1]])}" <{user["email"]}>'
            msg['Subject'] = title
            msg["Cc"] = request.data.get("Cc", '')
            body = MIMEText(body)
            msg.attach(body)
            logger.warning([addr for addr in msg["To"].split(';') + msg["Cc"].split(';')])
            logger.warning(msg["From"])
            with smtplib.SMTP(host='viruswall.mgi.de') as connection:
                connection.starttls()
                connection.sendmail(from_addr=msg["From"], to_addrs=[addr for addr in msg["To"].split(';') + msg["Cc"].split(';') if addr] ,msg=msg.as_string())
            return Response({"ok": "ok"})
        return Response({"ok": "not ok"})


class NotifyApi(APIView):
    def post(self, request):
        user = request.session.get('user', '')
        action = request.data.get('action', '')
        invent = request.data.get('invent', '')
        items = request.data.get('items', [])
        if not any([invent ,action, user]):
            return Response({})
        sender = f'"{', '.join([word.capitalize() for word in user['username'].split('.')[::-1]])}" <{user["email"]}>'
        store = mars_insight.search(item_type="Store", iql=f'"Name" = {invent}')[0]
        body = get_mail_text(action, invent, items) + f'\n\nBest regards,\n{', '.join([word.capitalize() for word in user['username'].split('.')[::-1]])}\nMETRO Cash & Carry Ltd'
        to, cc = self.get_to_cc(action, store)
        return Response({"From": sender, 'title': f'Инвентаризация ИТ оборудования в ТЦ {invent} IT-','body': body, "To": to, 'Cc':cc})

    def get_to_cc(self, action,  store):
        match action:
            case "open" | "mobile":
                to = store.get("Store_Email_Everyone", "")
                cc = "12345@mail.ru"
            case "start" | "close":
                to = "; ".join(store.get('STORE EMAIL', ''))
                cc = "54678@mail.ru"

        return  to, cc


def form_letter(user, items, store):
    From = f'"{user["ФИО"]}" <{user["Email"]}>'
    To = [item["User"]["Email"] for item in items]
    cc = [user["Email"]]
    subject = f"Инвентаризация мобильного оборудования в тц {store}"
    return {"letter": [From, To, cc, subject]}
