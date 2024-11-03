from django.shortcuts import render
from django.views.generic import TemplateView


from rest_framework.response import Response
from rest_framework.views import APIView
from users.IDAM import IDAMAuthMixin
from logic.MARS import mars_insight


class IndexView(IDAMAuthMixin, TemplateView):
    template_name = "index.html"

    def get(self, request):
        context = {"title": "Home page"}
        return render(request, self.template_name, context)


class EquipEditMainView(IDAMAuthMixin, TemplateView):
    template_name = "equipment_editing_main.html"

    def get(self, request, *args, **kwargs):
        self.extra_context = {"title": "Учет оборудования"}
        return super().get(request, *args, **kwargs)


class ITIQLRun(APIView):
    # permission_classes = [ITPermission]
    # http_method_names = ['post']

    def post(self, request):
        if item_type := request.data.get("itemType", ""):
            print(item_type)
            result = mars_insight.search(
                item_type=item_type,
                iql=request.data.get("iql", ""),
                order_field=request.data.get("order_field", "Name"),
                deep=request.data.get("deep", 1),
                results=request.data.get("results", 500),
            )
            return Response({"result": result})
        return Response({"result": "No item type"})
