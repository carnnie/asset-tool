from django.urls import path

from facility_invent.views import FieldsView, MainView


app_name = "facility_invent"

urlpatterns = [
    path("", MainView.as_view()),
    path("fields/", FieldsView.as_view()),
]
