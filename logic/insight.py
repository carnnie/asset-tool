import requests
import mimetypes
import logging
from requests_toolbelt.multipart.encoder import MultipartEncoder


logger = logging.getLogger("main")

class Insight:
    def __init__(self, url:str, auth:tuple) -> None:
        self.url = f"{url}/rest/insight/1.0"
        self.session = requests.Session()
        self.session.auth = auth
        self.headers = {"Content-Type": "application/json"}
    
    def status_code(func):
        def wrapper(*args, **kwargs):
            response = func(*args, **kwargs)
            match response.status_code:
                case 200 | 201:
                    return response.json()
                case 500:
                    print(response.status_code)
                    print(response.json())
                case _:
                    print(response.status_code)
                    print(response.json())
            return {}
        return wrapper
    
    @status_code
    def search(self, iql: str, schema_id: int, results:int=50, deep=1) -> dict:
        url = f"{self.url}/iql/objects"
        params= {"iql": iql, "page": 1, "resultPerPage": results, "objectSchemaId": schema_id, 'includeAttributesDeep':deep}
        return self.session.get(url=url, params=params, headers=self.headers)
    
    @status_code
    def update(self, id, schema_id, type_id, attrs) -> dict:
        url = f"{self.url}/object/{id}"
        json = {"objectSchemaId": schema_id, "objectTypeId": type_id, "attributes": []}
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
        return self.session.put(url=url, headers=self.headers, json=json)
    
    @status_code
    def delete(self, id) -> dict:
        url = f"{self.url}/object/{id}"
        return self.session.delete(url=url)

    @status_code
    def set_attachment(self, object_id, attachment, file_name, mimetype) -> dict:
        url = f"{self.url}/attachments/object/{object_id}"
        mimetypes.init()
        data = MultipartEncoder({"encodedComment": "", "file": (file_name, attachment, mimetype)})
        headers = {"Content-Type": data.content_type}
        return self.session.post(url=url, headers=headers, verify=False, data=data)
    
    @status_code
    def get_attributes(self, type_id, all=False):
        url = f"{self.url}/objecttype/{type_id}/attributes"
        params= {'onlyValueEditable': not all}
        return self.session.get(url=url, params=params, headers=self.headers)


class InsightMap:
    _map = {
        "AD_User": {"schema_id": 2,'type_id': 57, "fields": {}, 'reversed': {}},
        "Hardware": {"schema_id": 1,'type_id': 8, "fields": {}, 'reversed': {}},
        "Inventory_IT": {"schema_id": 1,'type_id': 225, "fields": {}, 'reversed': {}},
        "E-Requests": {"schema_id": 1,'type_id': 78, "fields": {}, 'reversed': {}},
        "Store": {"schema_id": 1,'type_id': 16, "fields": {}, 'reversed': {}},
        "State": {"schema_id": 1,'type_id': 60, "fields": {}, 'reversed': {}},

    }

    def __init__(self, insight) -> None:
        self.insight: Insight = insight
        self.init_map()

    def init_map(self):
        for key, value in self._map.items():
            type_id = value['type_id']
            self._map[key]["fields"] = self._get_props(type_id)
            self._map[key]["reversed"] = {value: key for key, value in self._map[key]["fields"].items()}
        
    def _get_props(self, type_id) -> dict:
        attrs = dict()
        response = self.insight.get_attributes(type_id=type_id)
        for attr in response:
            attrs[attr["id"]] = attr["name"]
        return attrs

    def delete(self, id):
        return self.insight.delete(id)

    def search(self, iql: str, item_type, results:int=500):
        items = self._map.get(item_type, '')
        if items:
            iql = f"{iql} AND objectTypeId = {items['type_id']}"
            objs = self.insight.search(iql=iql, schema_id=items['schema_id'], results=results)
            return [self.decode(obj, items['fields']) for obj in objs["objectEntries"]] if objs else []
        return []
    
    def set_attachment(self, object_id, attachment, file_name, mimetype) -> dict:
        return self.insight.set_attachment(object_id, attachment, file_name, mimetype)

    def set(self, id,  attrs, item_type):
        attrs = self.encode(attrs=attrs, item_type=item_type)
        type_id=self._map[item_type]["type_id"]
        schema_id=self._map[item_type]["schema_id"]
        obj = self.insight.update(id=id, type_id=type_id, schema_id=schema_id, attrs=attrs)
        item = self._map.get(item_type, '')
        if item:
            return self.decode(obj=obj, fields=item['fields'])
        return {}

    def decode(self, obj: dict, fields, user=False) -> dict:
        """Создает человекочитаймый слоарь из JSON ответа, пример ответа:
        https://docs.atlassian.com/assets/REST/9.1.16/#object-createObject"""
        obj_dict = dict()
        obj_dict["link"] = obj['_links']["self"]
        obj_dict["id"] = obj['id']
        for attr in obj["attributes"]:
            attr_id = attr["objectTypeAttributeId"]
            attr_val = attr["objectAttributeValues"][0]["displayValue"]
            key = fields.get(attr_id)
            if key:
                obj_dict[fields[attr_id]] = attr_val
            if attr_id == 223 and user:
                obj_dict["User"] = self.decode(attr["objectAttributeValues"][0]["referencedObject"], fields=self._map["AD_User"]["fields"], user=False)
        return obj_dict
    
    def encode(self, attrs: dict, item_type) -> dict:
        return {self._map[item_type]["reversed"][key]: value for key, value in attrs.items()}
