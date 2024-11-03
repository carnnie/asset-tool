from django.urls import include, path
from .views import *

app_name = "it_inv_manage"

urlpatterns = [
    path("", MainView.as_view(), name="main"),
    path("cancel/", CancelInventory.as_view(), name="cancel"),
    path("open/", OpenInventory.as_view(), name="open"),
    path("close/", CloseInventory.as_view(), name="close"),
]
