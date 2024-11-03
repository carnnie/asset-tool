import mimetypes
import requests
import logging

from requests_toolbelt.multipart.encoder import MultipartEncoder


logger = logging.getLogger("jira")

class Jira:
    """https://docs.atlassian.com/software/jira/docs/api/REST/9.13.0/"""

    def __init__(self, url: str, auth, project: int) -> None:
        self.url = f"{url}"
        self.project = project
        self.session = requests.Session()
        self.session.auth = auth
        self.headers = {"Content-Type": "application/json"}
        self.fields = self.form_fields() 


    def status_code(func):
        def wrapper(*args, **kwargs):
            response = func(*args, **kwargs)
            logger.warning(f'Запрос к Jira >> {args, kwargs}')
            match response.status_code:
                case 200 | 201:
                    logger.warning(f'Запрос к Jira >> успех ')
                    return response.json()
                case 500:
                    logger.error(f'Запрос к Jira >> Сервер Jira недоступен!')
                case _:
                    logger.error(f'Серваер Jira при выполнении операции вернул статус код {response.status_code} >> {args, kwargs}')
            return {}
        return wrapper


    def custom_field(self, field_name) -> str | None:
        return self.fields[field_name]["id"]

    def form_fields(self):
        result = {}
        for field in self.get_fields():
            try:
                result[field['name']] = {
                                        'id': field['id'],
                                        'type': field['schema']['type']
                                        }
            except:
                pass
        return result
    
    def form_request_fields(self, fields):
        result = dict()
        for field, value in fields.items():
            cur_field = self.fields.get(field, {"id": field, 'type': "string"})
            match cur_field['type']:
                case 'string' | 'number':
                    result[cur_field['id']] = value
                case 'option':
                    result[cur_field['id']] = {"value": value }
                case 'array':
                    if isinstance(value, list):
                        result[cur_field['id']] = [{"value": v} for v in value]
                    elif isinstance(value, (str, int)):
                        result[cur_field['id']] = [{"value": value}]
        return result
    
    @status_code
    def get_fields(self):
        url = f"{self.url}/rest/api/2/field"
        return self.session.get(url, headers=self.headers)
    
    @status_code
    def get_custom_field_options(self, field_name): #EXPERIMENTAL
        url = f"{self.url}/rest/api/2/field/{self.fields[field_name]}/option"
        return self.session.get(url, headers=self.headers)

    @status_code
    def get_info(self):
        url = f"{self.url}/rest/servicedeskapi/info"
        return self.session.get(url, headers=self.headers)

    @status_code
    def create_issue(self, type_id: int| str, fields:dict):
        ''' кормим словарем в котором обязательно есть тема summary'''
        url = f"{self.url}/rest/api/2/issue"
        json = \
                {'fields':
                        {
                         **self.form_request_fields(fields),
                         'issuetype': {
                                      "id": type_id
                                      },
                         "project": {
                                      "id": self.project, 
                                    },
                        },
                }
        return self.session.post(url, headers=self.headers, json=json)

    @status_code
    def get_issue(self, key_or_id:str| int):
        url = f'{self.url}/rest/api/2/issue/{key_or_id}'
        return self.session.get(url, headers=self.headers)
    
    @status_code
    def add_labels_issue(self,  key_or_id:str| int, labels: list | str):
        url = f"{self.url}/rest/api/2/issue/{key_or_id}"
        json = {'update':
                                                    {
                                                    'labels': [{"add": label} for label in labels] if isinstance(labels, list) else [{"add": labels}]
                                                    },
                                                }
        return self.session.put(url, headers=self.headers, json=json)

    @status_code
    def add_comment(self, key_or_id: str|int, body: str):
        url = f'{self.url}/rest/api/2/issue/{key_or_id}/comment'
        json = {'body': body}
        return self.session.post(url, headers=self.headers, json=json)
    
    @status_code
    def issue_search(self, jql:str):
        query = {'jql': jql}
        url = f'{self.url}/rest/api/2/search'
        return self.session.get(url, headers=self.headers, params=query)
    
    #attachments
    def add_attachments(self, key_or_id: str| int, file_name:str, attachment, mimetype, answer=False):
        '''  '''
        url = f'{self.url}/rest/api/2/issue/{key_or_id}/attachments'
        mimetypes.init()
        data = MultipartEncoder({"encodedComment": "", "file": (file_name, attachment, mimetype)})
        headers = {"Content-Type": data.content_type, "X-Atlassian-Token": "no-check"} #Токен не проверять тут =)
        return self.session.post(url, headers=headers, data=data, verify=False)

    @status_code
    def get_issue_meta(self, issue_example):
        url = f'{self.url}/rest/api/2/issue/{issue_example}/editmeta'
        return self.session.get(url)

