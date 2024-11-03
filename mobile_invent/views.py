from django.shortcuts import render
from django.views.generic import TemplateView, View
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response

from uuid import uuid4
import logging

import re

from mobile_invent.logic.word_blanks import WordDocument
from mobile_invent.logic.mapping import BLANK_MAP


from .b_logic import give_away, take_back, send, give_away_it, jira
from users.IDAM import IDAMAuthMixin
from users.permissions import UserPermission, ITPermission, IsUserMixin
from logic.MARS import mars_insight


# Logging
logger = logging.getLogger("main")

# Create your views here.
class MainView(IDAMAuthMixin, IsUserMixin , TemplateView):
    template_name = "index.html"
    
    def get(self, request):
        return render(request, self.template_name)


class ITIQLRun(APIView):
    '''
    Это универсальное вью при необходимости можно будет вынести
    в приложение которое будет работать с MARSом 
     '''
    permission_classes = [ITPermission]
    http_method_names = ['post']

    def post(self, request):
        if item_type:=request.data.get('itemType', ''):
            result = mars_insight.search(item_type=item_type, 
                                         iql=request.data.get('iql', ''), 
                                         deep=request.data.get('deep', 1), 
                                         results=request.data.get('results', 500))
            return Response({'result': result})
        return Response({'error': "No item type"})



# # Mobile API Views для получения обьектов из инсайт
class BaseMobile(APIView):
    permission_classes = [UserPermission|ITPermission]
    device_types = ['"LAPTOP"', '"WIRELESS HANDHELD"']
    http_method_names = ['post']
    iql :str

    def form_iql(self, search, user) -> str:
        iql = self.iql.replace("$SEARCH", search)
        iql = iql.replace("$TYPE", ", ".join(self.device_types))
        if ITPermission.is_user_it(user):
            iql = iql.replace('AND "Store" IN ($STORES)', '')
        else:
            iql = iql.replace("$STORES", ",".join(user["store_role"]))
        return iql 

    def get_items(self, search, user) -> dict:
        return {}


class TakeBackView(BaseMobile):
    iql = '"INV No" LIKE $SEARCH OR "Serial No" LIKE $SEARCH OR "User" LIKE $SEARCH AND "Type" IN ($TYPE) AND "Store" IN ($STORES) AND "User" is not empty'

    def post(self, request):
        if querry:= request.data.get('querry', False):
            iql = self.form_iql(search=querry, user=request.session["user"])
            data = mars_insight.search(iql=iql, item_type='Hardware', deep=1)
            return Response({'result': data})
        return Response({'result': [], "error": "No querry"})


class GiveAwayView(BaseMobile):
    iql = '"Name" LIKE $SEARCH AND "Реквест" LIKE $SEARCH'

    def post(self, request):
        if querry:= request.data.get('querry', False):
            data = self.get_items(search=querry, user=request.session["user"])
            return Response({'result': data})
        return Response({'result': [], "error": "No querry"})

    def get_items(self, search, user):
        '''Слишком жирная и непонятноая функция, на [Refactoring]'''
        result = {}
        jira_id = re.findall(r"^\d{6}$|ITREQ-\d{6}$", search.upper())  # ищем только по фул номеру реквеста
        if not jira_id:     
            return []
        stores: dict[str, str] =  {store["Name"]: store['Jira issue location'] for store in mars_insight.search(item_type="Store", iql='"Name" IS NOT empty') if store.get('Jira issue location', False)}
        user_stores = f' AND "Issue Location" IN ({','.join([f'"{stores[store]}"'  for store in user["store_role"]])})' if user["store_role"] and  not ITPermission.is_user_it(user) else ''
        iql = self.form_iql(search=search, user=user)
        ereqs = mars_insight.search(iql=iql, item_type='E-Requests')
        jql: str = f'key = {jira_id[0]} and status in ("SSS To Do", "Wait Delivery") and (labels !="hwr_done" OR labels is EMPTY) and "For user" is not EMPTY and "inv." is not EMPTY{user_stores}'
        jira_reqs = jira.issue_search(jql).get('issues')
        if jira_reqs and ereqs:
            req = jira_reqs[0]
            result = ereqs[0]
            item_number = self.get_item_number(req["fields"]['customfield_13400'])
            hw = mars_insight.search(item_type="Hardware", iql = f'"INV No" = {item_number} OR "Serial No" = {item_number}') #  find hardware
            result['Инв No и модель'] = hw[0]['Name'] if hw else ''
            result["jira key"] = req['key']
            for field, name in {"For user": 'name', "Issue Location":  'value', 'inv.': "value", }.items():
                field_id = jira.fields[field]['id']
                field_data = req["fields"][field_id]
                if isinstance(field_data, str):
                    result[field] = field_data
                elif isinstance(field_data, list):                   # field_data = [{'name': ..., 'key': ..., 'emailAddress': ...}] (type=array)
                    result[field] = field_data[0][name]
                else:                                                # field_data = {'name': ..., 'key': ..., 'emailAddress': ...} (type=option)
                    result[field] = field_data[name]
        if result:
            return [result]
        logger.error(f'Неудачный запрос: iql >>{iql};\n{"\t"*7}jql: {jql}')
        return []

    def get_item_number(self, number: str) -> str:
        if re.findall(r"^\d{6}$|MCC-\d{6}|MCC\d{6}$", number.upper()):
            return number[-6:]
        return number
    
    def search_item(self, itreq:str) -> dict:
        ...
    
    def search_items(self, itreq: str) -> dict:
        ...


class SendView(BaseMobile):
    iql = 'State = ApprovedToBeSent AND "Store" IN ($STORES)'

    def post(self, request):
        # тут нам не важен запрос, метод POST используйтся для унификации на стороне фронетэнда
        iql = self.form_iql(search='', user=request.session["user"])
        data = mars_insight.search(iql=iql, item_type='Hardware')
        return Response({'result': data})


class GiveAwayITView(BaseMobile):
    permission_classes = [ITPermission] # переопределено в целях безопасности
    iql = '"INV No" LIKE $SEARCH OR "Serial No" LIKE $SEARCH AND "Type" IN ($TYPE) AND "Store" IN ($STORES) AND "User" is empty'

    def post(self, request):
        if querry := request.data.get('querry', False):
            iql = self.form_iql(search=querry, user=request.session["user"])
            data = mars_insight.search(iql=iql, item_type='Hardware')
            return Response({'result': data})
        return Response({'result': [], "error": "No querry"})



class StoreView(BaseMobile):
    ''' Отдельное Вью для загрузки списка сторов без IT роли, безопасность'''
    iql = '"Name" IS NOT empty'

    def post(self, request):
        iql = self.form_iql(search='', user=request.session["user"])
        data = mars_insight.search(iql=iql, item_type='Store')
        return Response({'result': data})


# View ответсвенные за логику работы с бланками и изменением данных в инсайт 
# !Повышенное внимание к безопаности
class DownloadBlankView(APIView):
    permission_classes = [UserPermission|ITPermission]

    def post(self, request):
        action, item = self.get_request_data(request)
        if not action or not item:
            return {}
        item_type = self.check_item_type(item)
        data = {"$DEVICE":item.get("Model",''), "$NUMBER": f'{item.get("Serial No",'')} / {item.get("INV No",'')}'}
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        WordDocument(path=BLANK_MAP[action][item_type.lower()]).change_document_text(data=data).save(response)
        response['Content-Disposition'] = 'attachment; filename=download.docx'
        return response


    def get_request_data(self, request) -> tuple[str, dict]:
        action: str = ''
        item: dict = {}
        match request.data.get("action",''):
            case 'takeback':
                action = "Сдать"
                item = request.data.get("item",'')
            case "giveaway":
                action = 'Выдать'
                insight_objects = mars_insight.search(iql=f'"INV No" = "{request.data.get("item",{}).get("inv.", "")[-6:]}"', item_type="Hardware")
                item = insight_objects[0] if insight_objects else {}
            case "giveawayIT":
                action = 'Выдать'
                item = request.data.get("item",'')
            case _:
                pass
        return (action, item)
    
    def check_item_type(self, item):
        if "NOKIA" in item.get("Model",'').upper():
            item_type= "NOKIA"
        elif 'IPAD' in item.get("Model",'').upper():
            item_type= "IPAD"
        else:
            item_type = item.get("Type",'').upper()
        return item_type

    def get_file_name(self, action, type) ->str:
        return f'{action} {type}.pdf'


@method_decorator(csrf_exempt, name='dispatch') # изменить валидацию и вклинить в js csrf
class HandleUserAction(View): # async
    http_method_names = ["post"]
    permission_classes = [UserPermission|ITPermission]

    def post(self, request):
        action = request.POST.get('action', '')
        user = request.session['user']
        file = request.FILES["file"] if action != "send" else True
        item = eval(request.POST.get('item', '{}'))
        operation_id = str(uuid4())[-12:]           # id для логгиования
        logger.info(f'<{operation_id}>: {user["email"]} get action={action} with {item.get('INV No', '') if item.get('INV No', '') else item.get('inv.', '')}')
        if self.is_invalid(file, item):
            logger.warning(f"Incorrect data with operation {operation_id}")
            return JsonResponse({'result': '', 'error': f"Не корректные данные, при совершении действия {operation_id}"})
        match action:
            case 'takeback':
                msg = take_back(item=item, file_data=file, current_user=user, operation_id=operation_id)
            case 'giveaway':
                msg = give_away(item=item, file_data=file, current_user=user, operation_id=operation_id)
            case 'giveawayIT':
                to_user = eval(request.POST.get('to_user', '{}'))
                itreq = request.POST.get('itreq', '')
                store = eval(request.POST.get('store', '{}'))
                location = eval(request.POST.get('location', '{}'))
                msg = give_away_it(item=item, file_data=file, current_user=user, to_user=to_user, 
                                         operation_id=operation_id, store=store, location=location, itreq=itreq)
            case 'send':
                track = request.POST.get("track", "")
                store = request.POST.get('store', "")
                msg =  send(item=item, store=store, user=user, track=track ,operation_id=operation_id)
            case _:
                msg = 'Incorrect action'
        logger.warning(f'<{operation_id}> >> {user["email"]} {msg if msg else "уф...операция прошла успешно"}')
        return JsonResponse(msg)

    def is_invalid(self, file, item):
        return not (bool(file) and bool(item))
