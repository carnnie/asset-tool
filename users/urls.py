from django.urls import path
from users.views import LogoutView, WhoAmIView

urlpatterns = [
    path("whoami/", WhoAmIView.as_view()),
    path("logout/", LogoutView.as_view()),
]
