from ast import arg
from cmath import e
import json
import logging
from urllib import response
from uu import encode
import requests
import requests_async

from asgiref.sync import sync_to_async

from dotenv import load_dotenv
import os



logger = logging.getLogger("main")


class MARS:
    URL = "https://api.metronom.dev/ru-insight"
    headers = {
        "Content-Type": "application/json",
        "Authorization": ""}

    def __init__(self, username, password, token, client_id) -> None:
        self.username = username
        self.password = password
        self.token = token
        self.client_id = client_id


    def status_code(func) -> callable:
        def wrapper(self, *args, **kwargs):
            resp = func(self, *args, **kwargs)
            data = {}
            match resp.status_code:
                case 200:
                    data = resp.json()
                case 500:
                    ...
                case _:
                    self.refresh_token()
                    data = func(self, *args, **kwargs).json()
            try:
                return json.loads(data["result"])
            except KeyError:
                logger.warning(data)
                return {}
        return wrapper
    

    def refresh_token(self):
        url = "https://api.metronom.dev/uaa/oauth/token"
        headers = {"Content-Type": "application/x-www-form-urlencoded", "Authorization": f"Basic {self.token}", }
        params = {"grant_type": "password", "username": self.username, "password": self.password}
        response = requests.get(url=url, headers=headers, params=params, verify=False, timeout=20)
        token = response.json()['access_token']
        self.headers["Authorization"] = f"Bearer {token}"

    async def async_token(self):
        url = "https://api.metronom.dev/uaa/oauth/token"
        headers = {"Content-Type": "application/x-www-form-urlencoded", "Authorization": f"Basic {self.token}", }
        params = {"grant_type": "password", "username": self.username, "password": self.password}
        response = await requests_async.get(url=url, headers=headers, params=params, verify=False, timeout=20)
        token = response.json()['access_token']
        self.headers["Authorization"] = f"Bearer {token}"

    @status_code
    def run_iql(self, iql, scheme, results, deep):
        url = self.URL + '/iql/run'
        json = {
                        "iql":iql,
                        "client_id": self.client_id,
                        "scheme": scheme,
                        "options": {
                            "resultPerPage": results,
                            "includeAttributes": True,
                            "includeAttributesDeep": deep,
                            }
                    }
        response = requests.post(url=url, headers=self.headers, json=json, verify=False, timeout=20)
        return response



    async def async_run_iql(self, iql, scheme, results, deep):
        url = self.URL + '/iql/run'
        json_data = {
                        "iql":iql,
                        "client_id": self.client_id,
                        "scheme": scheme,
                        "options": {
                            "resultPerPage": results,
                            "includeAttributes": True,
                            "includeAttributesDeep": deep,
                            }
                    }
        response = await requests_async.post(url=url, headers=self.headers, json=json_data, verify=False, timeout=20)
        if response.status_code not in {200, 500}:
            await self.async_token()
            response = await requests_async.post(url=url, headers=self.headers, json=json_data, verify=False, timeout=20)
        data = response.json()
        return json.loads(data["result"])


    @status_code
    def object_run(self, type_id, scheme):
        url = self.URL + '/objects/run'
        json = {
                        "client_id": self.client_id,
                        "scheme": scheme,
                        "method":"attributes",
                        "objectTypeId":type_id
                    }
        response = requests.post(url=url, headers=self.headers, json=json, verify=False)
        return response
    
    @status_code
    def update_run(self, id, type_id, scheme, attrs):
        url = self.URL + '/update/run'
        json = {
                        "client_id": self.client_id,
                        "scheme": scheme,
                        "objectTypeId":type_id,
                        "objectId": id,
                        "attributes": []
                    }
        for object_type_attribute_id, object_attribute_values in attrs.items():
            if isinstance(object_attribute_values, (list, tuple)):
                attribute_values = [{"value": value for value in object_attribute_values}]
            else:
                attribute_values = [{"value": object_attribute_values}]
            json["attributes"].append(
                {
                    "objectTypeAttributeId": object_type_attribute_id,
                    "objectAttributeValues": attribute_values,
                }
            )
        response = requests.post(url=url, headers=self.headers, json=json, verify=False)
        return response

    @status_code
    def create_run(self, type_id, scheme, attrs):
        url = self.URL + "/create/run"
        json = {
            "client_id": self.client_id,
            "scheme": scheme,
            "objectTypeId": type_id,
            "attributes": [],
        }

        for object_type_attribute_id, object_attribute_values in attrs.items():
            if isinstance(object_attribute_values, (list, tuple)):
                attribute_values = [{"value": value} for value in object_attribute_values]
            else:
                attribute_values = [{"value": object_attribute_values}]
            json["attributes"].append(
                {
                    "objectTypeAttributeId": object_type_attribute_id,
                    "objectAttributeValues": attribute_values,
                }
            )
        response = requests.post(url=url, headers=self.headers, json=json, verify=False)
        return response


from api.models import InsightEntity


class Insight:

    def __init__(self, MARS) -> None:
        self.insight = mars
    
    def decode(self, obj: dict, fields, deep=1) -> dict:
        """Создает человекочитаймый слоарь из JSON ответа, пример ответа:
        https://docs.atlassian.com/assets/REST/9.1.16/#object-createObject"""
        deep = deep - 1
        obj_dict = dict()
        obj_dict["link"] = obj['_links']["self"]
        obj_dict["id"] = obj['id']
        for attr in obj["attributes"]:
            attr_id = attr["objectTypeAttributeId"]
            key = fields.get(attr_id)
            attr_val = False
            for a in attr["objectAttributeValues"]:
                if deep and a['referencedType'] and InsightEntity.check_type_id(a['referencedObject']['objectType']['id']):
                    attr_val_tmp = self.decode(a['referencedObject'],  deep=deep)
                else:
                    attr_val_tmp = a["displayValue"]
                match attr_val:
                    case bool():
                        attr_val = attr_val_tmp
                    case list():
                        attr_val.append(attr_val_tmp)
                    case _:
                        attr_val = [attr_val, attr_val_tmp]
            if key:
                obj_dict[fields[attr_id]] = attr_val
        return obj_dict
    

    def encode(self, attrs: dict, fields:dict) -> dict:
        return {fields[key]: value for key, value in attrs.items()}


    def search(self, item_type, order_field="Name", iql: str='', results:int=500, deep=1):
        entity = InsightEntity.objects.get(name=item_type)
        if entity:
            if iql:
                iql += " AND "
            iql = f'{iql}objectTypeId = {entity.type_id} ORDER BY "{order_field}" ASC'
            objs = self.insight.run_iql(iql=iql, scheme=entity.schema, results=results, deep=deep)
            return [self.decode(obj, fields=entity.fields, deep=deep) for obj in objs["objectEntries"]] if objs else []
        return []
    

    async def async_search(self, item_type, order_field="Name", iql: str='', results:int=500, deep=1):
        entity = await sync_to_async(InsightEntity.objects.get)(name=item_type)
        afields = await entity.afields()
        if entity:
            if iql:
                iql += " AND "
            iql = f"{iql}objectTypeId = {entity.type_id} ORDER BY {order_field} ASC"
            objs = await self.insight.async_run_iql(iql=iql, scheme=entity.schema, results=results, deep=deep)
            return [self.decode(obj, fields=afields, deep=deep) for obj in objs["objectEntries"]] if objs else []
        return []


    def set(self, id,  attrs, item_type):
        entity = InsightEntity.objects.get(name=item_type)
        attrs = self.encode(attrs=attrs, fields=entity.reversed_fields)
        obj = self.insight.update_run(id=id, scheme=entity.schema, type_id=entity.type_id, attrs=attrs)
        if entity:
            return self.decode(obj=obj, fields=entity.fields)
        return {}


    def create(self, item_type, attrs):
        entity = InsightEntity.objects.get(name=item_type)
        attrs = self.encode(attrs=attrs, fields=entity.reversed_fields)
        response = [self.insight.create_run(scheme=entity.schema, type_id=entity.type_id, attrs=attrs)]
        return response[0] if response else []


load_dotenv()

mars = MARS(username=os.environ.get("MARS_USERNAME"),
            password=os.environ.get("MARS_PASSWORD"), 
            token=os.environ.get("MARS_TOKEN"),
            client_id=432519)
mars_insight = Insight(MARS=mars)

