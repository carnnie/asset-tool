from django.urls import path

from core.views import IndexView
from .views import (
    DeleteEreqView,
    InventData,
    NotifyApi,
    NotifySendApi,
    ToExcelView,
)

urlpatterns = [
    path("", IndexView.as_view(), name="invent_main"),
    path("notify/mails/", NotifyApi.as_view(), name="notify"),
    path("api_inv/", InventData.as_view(), name="invent_api"),
    path("api_inv/report/", ToExcelView.as_view(), name="report"),
    path("api_inv/replace", DeleteEreqView.as_view(), name="replace"),
    path("notify/send/", NotifySendApi.as_view(), name="notify_api"),
]
