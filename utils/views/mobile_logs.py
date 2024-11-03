from django.shortcuts import render
from django.views.generic import View


class LogView(View):
    def get(self, request):
        logs = Logs()
        return render(request, 'mobile_invent/logs.html' ,{'success': logs.success(), "fails": logs.fails(), 'logs': logs.log_lines})




class Logs:
    log_file: str = "logs/mobile_invent.log"
    succ_pattern: str = '\'error\': \'\''
    fail_pattern: str = 'Упс...'

    def __init__(self,) -> None:
        self.log_lines: list[str] = self.read_logs(self.log_file)[::-1]

    def read_logs(self, log_file: str) -> list[str]:
        with open(log_file, 'r', encoding="utf-8") as file:
            lines = file.readlines()
        return lines
    
    def success(self) -> int:
        return len(set(line for line in self.log_lines if self.succ_pattern in line))
    
    def fails(self) -> int:
        return len(set(line[50:-18] for line in self.log_lines if self.fail_pattern in line))