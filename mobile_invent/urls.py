from django.urls import path

from .views import (
    DownloadBlankView,
    GiveAwayITView,
    GiveAwayView,
    MainView,
    SendView,
    TakeBackView,
    ITIQLRun,
    HandleUserAction,
    StoreView
)

urlpatterns = [
    path("", MainView.as_view(), name="mobile_main"),
    path("takeback/", TakeBackView.as_view()),
    path("giveaway/", GiveAwayView.as_view()),
    path("send/", SendView.as_view()),
    path("giveaway_it/", GiveAwayITView.as_view()),
    path("giveawayIT/", GiveAwayITView.as_view()),
    path("stores/", StoreView.as_view()),
    path("download_blank/", DownloadBlankView.as_view()),
    path("handle_user_action/", HandleUserAction.as_view()),
    

    path('it_iql/', ITIQLRun.as_view()),
]
