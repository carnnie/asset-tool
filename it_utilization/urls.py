from django.urls import include, path
from .views import *

app_name = "it_utilization"

urlpatterns = [
    path("", MainView.as_view()),
    path("handle-report/", HandleSAPReport.as_view()),
    path("send/", SendResult.as_view()),
]
