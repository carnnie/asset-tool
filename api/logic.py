import asyncio
import subprocess
import logging



from logic.MARS import mars_insight
from .zpl_map import zpl_fields


logger = logging.getLogger("main")

PRINT_SERVER = 'MOW30VPRS403'
PRINTER_PORT = 9100


async def print_label(msg:str|None, ip:str, port:int=9100) -> None:
    if msg is not None:
        reader, writer = await asyncio.open_connection(ip, port)
        df = bytes(msg, "utf-8")
        writer.write(df)
        await writer.drain()



class Printer:
    @staticmethod
    def valuable(string, key:str):
            val = string.replace(key, '')
            val = val.replace(":", '')
            return val.strip()
    
    @staticmethod
    def get_printers_data(mask:str=''):
            command = f'Get-Printer -ComputerName {PRINT_SERVER} '
            if mask:
                command += f'-Name "{mask}" '
            printer_list = subprocess.Popen(['powershell.exe',f"{command}| Format-List"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            out, err = printer_list.communicate()
            printer_list = out.decode('cp437').replace("\r\n", ",").split(",,")
            printer_list = [lst.split("SeparatorPageFile")[0] for lst in printer_list if lst]
            return printer_list

    @staticmethod
    def pars_printers_data(printers: list) -> dict:
            result = {}
            for printer in printers:
                printer = printer.split(",")
                printer_data = {}
                name = ''
                for field in printer:
                    if field.startswith('Name'):
                        name = Printer.valuable(field, "Name")
                        printer_data["name"] = name
                    elif field.startswith('PortName'):
                        printer_data["ip"] = Printer.valuable(field, "PortName").replace('IP_', '')
                    elif field.startswith('Location'):
                        printer_data["loc"] = Printer.valuable(field, "Location")
                    elif field.startswith('ShareName'):
                        printer_data["share"] = Printer.valuable(field, "ShareName")
                    elif field.startswith('DriverName'):
                        printer_data["driver"] = Printer.valuable(field, "DriverName")
                    elif field.startswith('Comment'):
                        printer_data["desc"] = Printer.valuable(field, "Comment")
                result[name] = printer_data
                result = dict(sorted(result.items(), key=lambda i: i[0].lower()))
            return result
    
    @staticmethod
    def run(mask:str):
        printers = Printer.get_printers_data(mask)
        return Printer.pars_printers_data(printers)
    
# Form zpl
def get_template(templates, label_app, label_id, label_type):
    for template in templates:
            if template["Label_App"] == label_app and template["Label_ID"] == label_id and template["Label_Type"] == label_type:
                return template['ZPL_Text']
    return None

            
def form_zpl(item, zpl):
    for key, attr in zpl_fields.items():
        value  = item.get(key, '')
        if value:
            zpl = zpl.replace(attr, value)
    return zpl

async def form_labels(data, template):
    match data:
        case list():
            result = await asyncio.gather(*[form_labels(one, template) for one in data])
            return [label[0] for label in result if len(label)]
        case dict():
            return [form_zpl(data, template.ZPL_Text)]
        case int() | str():
            match template.Label_App:
                case 'IT':
                    items = await mars_insight.async_search(item_type='Hardware', iql=f'"INV No" = "{data}" OR "Serial No" = "{data}"')
                    if items and len(items) == 1:
                        return [form_zpl(items[0], template.ZPL_Text)]
                case 'FixedAsset':
                    items = await mars_insight.async_search(item_type='FixedAssets_SAP', iql=f'"САП номер" = "{data}" OR "Серийный номер" = "{data}"')
                    if items and len(items) == 1:
                        return [form_zpl(items[0], template.ZPL_Text)]
            return []
        case _:
            return[]

async def pars_printer_name(name):
    if len(name) > 6:  
        mask = await mars_insight.async_search(item_type="PrinterMask", iql=f'"Mask_Name" LIKE "{name.split('_', 1)[1][:-5]}"')
        label_app = mask[0].get('Mask_App', '') if mask else ''
        return label_app, name[-4:]
    return '', ''