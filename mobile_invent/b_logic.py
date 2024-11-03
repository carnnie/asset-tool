import datetime
import os
import re
from reportlab.lib.pagesizes import letter
from django.core.exceptions import ValidationError
import logging
from uuid import uuid4
import dotenv
from logic.MARS import mars_insight
import time
from logic.insight import Insight, InsightMap
from logic.jira import Jira

Team = "Support Remote"

dotenv.load_dotenv()

try:
    insight_url = os.environ.get("INSIGHT_URL")
    jira_url = os.environ.get("JIRA_URL")
    login = os.environ.get("INSIGHT_USERNAME")
    password = os.environ.get("INSIGHT_SECRET")
except:
    pass

logger = logging.getLogger("main")
try:
    insight_api =  Insight(url='https://jirainvent.metro-cc.ru', auth=(login, password))
    insight = InsightMap(insight=insight_api)
    jira = Jira(url=jira_url, auth=(login, password), project=10000)  # project не действителен
except:
    logger.warning(f'при установке соединения произошла ошибка 500')


logger = logging.getLogger("main")

async def async_get_user(current_user):
    if current_user:
        iql = f'"Email" = {current_user['email']}'
        current_user_insight = await mars_insight.async_search(iql=iql, item_type="AD_User", results=1, order_field="ФИО")
        current_user_insight = current_user_insight[0].get("id", '') if current_user_insight else ''
    else:
        current_user_insight = ''
    return current_user_insight


def get_user(current_user):
    if current_user and current_user.get("email", ''):
        iql = f'"Email" = {current_user['email']}'
        current_user_insight = mars_insight.search(iql=iql, item_type="AD_User", results=1, order_field="ФИО")
        current_user_insight = current_user_insight[0].get("id", '') if current_user_insight else ''
    else:
        current_user_insight = ''
    return current_user_insight

def take_back(item, file_data, current_user, operation_id):
    response = {}
    try:
        user = item['User']
        inv_no = item['INV No']
        dev_id = item['id']
        store_num = item['Store']
        link = item['link']
        store_obj = mars_insight.search(iql=f'"Name" = {store_num}', item_type="Store", results=1)[0]
        jira_store = store_obj['Jira issue location']
        logger.warning(f'"Инв No и модель" LIKE "{dev_id}" AND "Пользователь" = "{user}"')
        ereq = mars_insight.search(iql=f'"Инв No и модель" LIKE "{dev_id}" AND "Пользователь" = "{user}"', item_type="E-Requests", results=1)
        count = len(ereq)
        ereq = ereq[0]
        cur_date = datetime.date.today()
        current_user_insight = get_user(current_user)
    except Exception as e:
        logger.warning(e)
        return {'result':'', "error":f'Упс... Что то пошло не так обратитесь в поддержку. Номер Вашей операции {operation_id}'}
    try:
        logger.warning(f'<{operation_id}> >> {user=} | {current_user_insight=} | {store_num=} | {jira_store=} | {inv_no=} | {link=}')
        # создаем инцидент в Jira и прикрепляем к нему бланк
        fields = {
            'summary': f'Сдача мобильного оборудования ТЦ {store_num}',
            'description': f'Пользователь {current_user['email']} создал задачу по сдаче {inv_no}\n{link}',
            "Metro Team": Team,
            "Issue Location": jira_store,
        }
        issue = jira.create_issue(type_id=10100, fields=fields)  # пока TYPE ID жестко захардкожен, временно
        jira.add_attachments(issue["key"],
                            attachment=file_data.file,
                            mimetype=file_data.content_type,
                            file_name=file_data.name)
        logger.warning(f'<{operation_id}>: запрос {issue["key"]} создан, файл прикреплен')
        logger.warning(ereq)
        response['ereq'] = mars_insight.set(
            id=ereq["id"],
            item_type="E-Requests",
            attrs={
                "Дата сдачи": f"{cur_date.day}/{cur_date.month}/{str(cur_date.year)[-2:]}",
                "Кто принял": current_user_insight,
                'Name': f'[{item['INV No']}] {item['Type']} - {item['Model']} {f'({count})' if count > 1 else ''}',
            },
        )
        updated_link = response['ereq'].get('link', '')
        logger.warning(f'<{operation_id}> >> бланк {updated_link} отредактирован')

        # прикрепляем к карточке бланк
        insight.set_attachment( object_id=ereq['id'],
                                attachment=file_data.file,
                                mimetype=file_data.content_type,
                                file_name=file_data.name)
        mars_insight.set(id=dev_id,item_type="Hardware" , 
                        attrs={'HWUserUpdate': current_user_insight})
        set_link = response['ereq'].get('link', '')
        logger.warning(f'<{operation_id}>: бланк и оборудование {set_link} отредактирован, файл прикреплен')
        return  {'result':f'Оборудование успешно сдано', "error":''}
    except Exception as e:
        logger.error(f'<{operation_id}> >> Exception: {e}')
        return {'result':'', "error":f'Упс... Что то пошло не так обратитесь в поддержку. Номер Вашей операции {operation_id}'}






def give_away(item, file_data, current_user, operation_id):
    response = {}
    try:
        jira_req_key = item['jira key']
        jira_req = jira.get_issue(jira_req_key)
    
        ''' достаем данные из jira заявки и insight'''
        jira_req = jira_req["fields"]
        for_user = jira_req[jira.custom_field('For user')]['emailAddress'] # jira.fields['For user']['id'] даест касотмное поле
        jira_inv_no = jira_req[jira.custom_field('inv.')][-6:]
        issue_location = jira_req[jira.custom_field('Issue Location')][0]['value']
        hardware = mars_insight.search(iql=f'"INV No" = {jira_inv_no}', item_type="Hardware", results=1)[0] 
        jira_for_user= mars_insight.search(iql=f'"Email" = {for_user}', item_type="AD_User", order_field="ФИО", results=1)[0]
        store = mars_insight.search(iql=f'"Jira issue location" = "{issue_location}"', item_type="Store")[0]
        current_user_insight =  get_user(current_user=current_user)
    except KeyError:
            logger.error(f'<{operation_id}> >> В реквесте не заполнены все поля')
            return  {'result':'', "error":f"В реквесте не заполнены все поля"}
    cur_date = datetime.date.today()
    logger.warning(f'<{operation_id}> >> {for_user=}| {jira_inv_no=} | {issue_location=}')
    try:
        if not file_data:
            logger.error(f'<{operation_id}> >> Не прикреплен файл')
            return  {'result':'', "error":"Ошибка загрузки файла"}


        if current_user_insight:
            response['ereq'] = mars_insight.set(
                                        id=item['id'],
                                        item_type="E-Requests",
                                        attrs={
                                            "Дата выдачи": f"{cur_date.day}/{cur_date.month}/{str(cur_date.year)[-2:]}",
                                            "Кто выдал": current_user_insight,
                                            "Store": store["id"],
                                            'Пользователь': jira_for_user['id'],
                                            'Инв No и модель': hardware["id"]
                                            },
                                        )
            set_link = response['ereq'].get('link', '')   
            logger.warning(f'<{operation_id}> >> бланк {set_link} отредактирован')
            insight.set_attachment(object_id=item['id'],
                                    attachment=file_data.file,
                                    mimetype=file_data.content_type,
                                    file_name=file_data.name)
            time.sleep(3)
            mars_insight.set(id=hardware["id"],item_type="Hardware" , 
                        attrs={'HWUserUpdate': current_user_insight})
           
            jira_comment = f"Выдача оборудования пользователю {for_user}\n{current_user['email']}: {set_link}"
            jira.add_comment(jira_req_key, body=jira_comment)
            jira.add_labels_issue(jira_req_key, labels='hwr_done')
            jira.add_attachments(jira_req_key,
                                    attachment=file_data.file,
                                    mimetype=file_data.content_type,
                                    file_name=file_data.name)
            logger.warning(f'<{operation_id}> >> запрос {jira_req_key} прокоментирован, файл прикреплен')
        else:
            return  {'result':'', "error":f"О пользователе {current_user.get('email', "Unknown User")} пытающегося выдать {hardware['link']} нет данных в инсайт"}
        return {'result':'Оборудование успешно выдано ', "error":''}
    except ValidationError as err:
        logger.error(f'{operation_id} >> {str(err)}')
        jira.add_comment(jira_req_key, body=str(err))
        return {'result':'', "error":f'Упс... Что то пошло не так обратитесь в поддержку. Номер Вашей операции {operation_id}'}
    except Exception as e:
        return {'result':'', "error":f'Упс... Что то пошло не так обратитесь в поддержку. Номер Вашей операции {operation_id}'}



def give_away_it(item, file_data, current_user, operation_id:str, to_user:str, store, location, itreq):
    try:
        jira_reqs = jira.issue_search(
            f'key = ITREQ-{itreq} and status = "SSS To Do" and (labels !="hwr_done" OR labels is EMPTY) and "For user" is not EMPTY and "inv." is not EMPTY').get('issues')
        hardware = item
        cur_date = datetime.date.today()
        current_user_insight =  get_user(current_user=current_user)
        name = f'[{item['INV No']}] {item['Type']} - {item['Model']}'
        ''' Если есть реквест то пишем в него '''
        ereq_old = mars_insight.search(iql=f'"Инв No и модель" = "{item['Name']}" AND "Реквест" LIKE "{itreq}" AND "Дата сдачи" is empty', item_type="E-Requests") if jira_reqs else []
    except Exception as e:
        logger.error(f'<{operation_id}> >> В реквесте не заполнены все поля {e}')
        return {'result':'', "error":f"В реквесте не заполнены все поля"}


    try:
        if not file_data:
            logger.error(f'<{operation_id}> >> Не прикреплен файл')
            return {'result':'', "error":f"Карточка и объект в Insight не изменены. Не прикреплен файл"}
        if current_user_insight and to_user:
            if ereq_old:
                ereq = ereq_old[0]
            else:

                res = mars_insight.search(iql=f'"Инв No и модель" = "{item['Name']}" AND "Name" LIKE "{name}"', item_type="E-Requests")
                ereq = mars_insight.create(
                                            item_type="E-Requests",
                                            attrs={
                                                "Name": f'{name}  {f"({len(res)-1})" if len(res) else ""}',
                                                'Инв No и модель': hardware['id'],
                                                'Пользователь': to_user,
                                                "Реквест": f"https://jira.metro-cc.ru/browse/ITREQ-{itreq}" if itreq else '',
                                                'Location': location['id'],
                                                'Store': store['id'],
                                                },
                                            )
                set_link = ereq.get('link', '')   
                logger.warning(f'<{operation_id}> >> бланк {set_link} создан')                        
            time.sleep(3)
            mars_insight.set(
                            id=ereq['id'],
                            item_type="E-Requests",
                            attrs={
                                "Дата выдачи": f"{cur_date.day}/{cur_date.month}/{str(cur_date.year)[-2:]}",
                                "Кто выдал": current_user_insight,
                                },
                            )
            time.sleep(3)
            insight.set_attachment(object_id=ereq['id'],
                        attachment=file_data.file,
                        mimetype=file_data.content_type,
                        file_name=file_data.name)
            mars_insight.set(id=item['id'] ,item_type="Hardware" , 
                        attrs={'HWUserUpdate': current_user_insight,})
            set_link = ereq.get('link', '')
            logger.warning(f'<{operation_id}> >> бланк {set_link} отредактирован')

            if jira_reqs:
                jira_comment = f"{current_user["username"]}<{current_user['email']}> Выдал оборудование: {set_link}"
                jira.add_comment(f'ITREQ-{itreq}', body=jira_comment)
                jira.add_labels_issue(f'ITREQ-{itreq}', labels='hwr_done')
                jira.add_attachments(f'ITREQ-{itreq}',
                                        attachment=file_data.file,
                                        mimetype=file_data.content_type,
                                        file_name=file_data.name)
                logger.warning(f'<{operation_id}> >> запрос {f'ITREQ-{itreq}'} прокоментирован, файл прикреплен')
            return {'result':f'Оборудование успешно выдано {set_link}', "error":''}
        else:
            logger.warning(f"О пользовател пытающегося выдать {hardware['link']} нет данных в инсайт")
            return {'result':'', "error":f"О пользовател пытающегося выдать {hardware['link']} нет данных в инсайт"}

    except ValidationError as err:
        logger.error(f'{operation_id} >> {str(err)}')
        return {'result':'', "error":f'Упс... Что то пошло не так . Номер Вашей операции {operation_id}'}
    except Exception:
        return  {'result':'', "error":f'Упс... Что то пошло не так . Номер Вашей операции {operation_id}'}



def send(item, store, track, user, operation_id):
    response = {}
    try:
        
        name = item.get('Name')
        dev_id = item.get('id')
        link = item.get('link')
        store_name = store
        logger.warning(f'{store_name=}')
        logger.error(f'<{operation_id}> >> 111')
        store = mars_insight.search(iql=f'"Name" = "{store}"', item_type="Store", results=1)[0]
        jira_store = store.get("Jira issue location", 'FLS')
        state = mars_insight.search(iql=f'"Name" = "Sent to"', item_type="State", results=1)[0]
        current_user_insight = get_user(current_user=user)
    except:
        logger.warning(f'{store=}{track=}{user=}{item=}')
        logger.error(f'<{operation_id}> >> Некорректные входные данные')
        return {'result':'', "error":f'Упс... Что то пошло не так обратитесь в поддержку. Номер Вашей операции {operation_id}'}
    logger.warning(f'<{operation_id}> >> {name=} | {state["Name"]=} | {current_user_insight=}')

    try:
        fields = {
                                'summary': f'Перемещение оборудования в ТЦ {store_name}',
                                'description': f'Пользователь {user['email']} создал задачу по пересылке {name}\nurl: {link} \nТрек номер: {track}',
                                "Metro Team": Team,
                                "Issue Location": jira_store,
                            }

        issue = jira.create_issue(type_id=10000, fields=fields)
        logger.warning(f'<{operation_id}>: запрос {issue["key"]} создан')

        response['device'] = mars_insight.set(
                                        id=dev_id,
                                        item_type="Hardware",
                                        attrs={
                                            "State": state["id"],
                                            "Store": store["id"],
                                            "Seal No": track,
                                            },
                                        )
        set_link = response['device'].get('link', '')   
        logger.warning(f'<{operation_id}> >> Данные {set_link} отредактированы')
        return {'result':'Оборудование успешно отправлено', "error":''}

    except:
        return {'result':'', "error":f'Упс... Что то пошло не так обратитесь в поддержку. Номер Вашей операции {operation_id}'}
