from django.urls import path

from .views import (
    MainView,
    SearchView,
    EditView,
)

app_name = "equipment_editing_group"

urlpatterns = [
    path("", MainView.as_view()),
    path("search/", SearchView.as_view()),
    path("edit/", EditView.as_view()),
]
