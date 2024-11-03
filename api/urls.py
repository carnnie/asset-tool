from django.urls import path
from .views import test_view


urlpatterns = [
    path('api_inv/test/', test_view, name="notify_api"),
]