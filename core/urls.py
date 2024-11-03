# from django.contrib import admin
from django.conf.urls import static
from django.contrib import admin
from django.urls import include, path

from core import settings


from .views import *

urlpatterns = [
    path("admin/", admin.site.urls),
    path("mobile/", include("mobile_invent.urls")),
    path("it-invent/", include("it_invent.urls")),
    path(
        "it-invent-mng/",
        include("it_inventory_management.urls", namespace="it-invent-mng"),
    ),
    path("equip-edit-main/", EquipEditMainView.as_view(), name="eqiup_edit_main"),
    path(
        "single-edit/",
        include("equipment_editing_single.urls", namespace="single-edit"),
    ),
    path("group-edit/", include("equipment_editing_group.urls", namespace="group_edit")),
    path("it-utilization/", include("it_utilization.urls", namespace="it-utilization")),
    path('facility-invent/', include('facility_invent.urls', namespace='facility-invent')),
    path("api_old/", include("api.urls")),
    path("", IndexView.as_view(), name="index"),
    path("auth/", include("users.urls")),
    path("utils/", include("utils.urls")),
    path("iql/", ITIQLRun.as_view(), name="iql"),
]

# urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
