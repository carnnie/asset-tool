from django.urls import path
from utils.views.fiscal_report import FiscalReportView
from utils.views.mobile_logs import LogView

def test(request):
    from django.shortcuts import render
    return render(request, "utils/test.html")

urlpatterns = [
    path('fr/', FiscalReportView.as_view(), name="fiscal_report"),
    path('mobile_logs/', LogView.as_view()),
    path("mail/", test)
]
