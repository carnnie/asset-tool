from django.http import HttpResponse
from django.shortcuts import render
from django.views.generic import View
import os
from uuid import uuid4
import pandas as pd
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

import logging
logger = logging.getLogger("main")



@method_decorator(csrf_exempt, name='dispatch')
class FiscalReportView(View):
    def get(self, requets):
        return render(requets, 'utils/fiscal.html')

    def post(self, request):
        report = Report(request.FILES.getlist('files')).form()
        with open(report, 'rb') as file:
            response = HttpResponse(file, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename={report}'
        os.remove(report)
        return response

class Report:
    fields = {
        'зав. номер ККТ': 'S/n ККТ ', 
        'зав. номер ФН': 'S/n ФН\n(серийный номер)',
        'дата, время': 'Установлен в ТЦ (дата)',
    }

    def __init__(self, files: list) -> None:
        self.files = files
    
    def read_txt(self, file) -> dict[str, str]:
        result: dict[str, str] = {}
        f = file.read()
        if len(f) < 1330:
            return {}
        lines = f.decode("utf-8").split('\n')
        for line in lines:
            for key in self.fields.keys():
                if line.startswith(key):
                    if key == 'дата, время':
                        result[self.fields[key]] = f"{line.split(':', 1)[-1].strip().split(' ')[0]}"
                        continue
                    result[self.fields[key]] = f"'{line.split(':')[-1].strip()}"
        for field, value in {'№ Паспорта ККТ':'', 'Установлен в ТЦ (дата)':'', 'Снят с учета': '', 'Причина':'Замена ФН', 'Подпись': '', 
                                                 'Паспорта утилизированы (по истечении 5 лет с момента снятия)': ''}.items():
            if not result.get(field, False):
                result[field] = value
        return result

    def fil_xlsx(self, name: str, data: list[dict[str, str]]):
        df = pd.DataFrame(data)
        df.to_excel(name, startcol=1, startrow=1, index=False)

    def form(self) -> str:
        name: str = f'{str(uuid4())[-6:]}.xlsx'
        data = []
        for file in self.files:
            if d:=self.read_txt(file):
                data.append(d)
        self.fil_xlsx(name, data)
        return name


