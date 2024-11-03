from django.urls import path

from equipment_editing_single.views import *

app_name = "ee_single"

urlpatterns = [
    path("", MainView.as_view()),
    path("edit/", EditView.as_view()),
    path("printers/", PrintersView.as_view()),
    path('print/', PrintView.as_view()),
]