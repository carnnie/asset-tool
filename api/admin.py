from django.contrib import admin

from .models import *


class ObjectFilter(admin.SimpleListFilter):
    title = "Объекты"
    parameter_name = "obj"

    def lookups(self, request, model_admin):
        return [
            ("Hardware", "Hardware"),
            ("E-Requests", "E-Requests"),
            ("Store", "Store"),
            ("Location", "Location"),
            ("State", "State"),
            ("Unit_Eq", "Unit_Eq"),
            ("Pallets", "Pallets"),
            ("Inventory_IT", "Inventory_IT"),
            ("InventoryCard", "InventoryCard"),
            ("AD_User", "AD_User"),
        ]

    def queryset(self, request, queryset):
        match self.value():
            case "Hardware":
                return queryset.filter(scheme=1, type_id=8)
            case "E-Requests":
                return queryset.filter(scheme=1, type_id=8)
            case "Store":
                return queryset.filter(scheme=1, type_id=16)
            case "Location":
                return queryset.filter(scheme=1, type_id=17)
            case "State":
                return queryset.filter(scheme=1, type_id=60)
            case "Unit_Eq":
                return queryset.filter(scheme=1, type_id=21)
            case "Pallets":
                return queryset.filter(scheme=1, type_id=120)
            case "Inventory_IT":
                return queryset.filter(scheme=1, type_id=225)
            case "InventoryCard":
                return queryset.filter(scheme=1, type_id=226)
            case "AD_User":
                return queryset.filter(scheme=2, type_id=57)


@admin.register(InsightEntity)
class InsightEntityAdmin(admin.ModelAdmin):
    list_display = ("name", "schema", "type_id")
    # filter_horizontal = ('props', )


@admin.register(Props)
class PropsAdmin(admin.ModelAdmin):
    list_display = ("attr", "field", "referenced", "type", "value_referenced")
    list_editable = ("referenced", "type", "value_referenced")


@admin.register(PropsTypes)
class PropsTypesAdmin(admin.ModelAdmin):
    list_display = ("name",)
