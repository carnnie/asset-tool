from django.shortcuts import render
from django.views.generic import TemplateView

from rest_framework.views import APIView
from rest_framework.response import Response

from api.models import InsightEntity
from users.IDAM import IDAMAuthMixin
from users.permissions import IsUserMixin


class MainView(IDAMAuthMixin, IsUserMixin, TemplateView):
    template_name = "index.html"

    def get(self, request):
        return render(request, self.template_name)


class FieldsView(APIView):
    def post(self, request):
        obj_type = request.data.get("objectType")
        if obj_type:
            objects = InsightEntity.objects.get(name=obj_type).props.all()
            response = [
                {
                    "name": obj.field,
                    "type": obj.type.name,
                    "ref": obj.value_referenced.name if obj.value_referenced else "",
                }
                for obj in objects
            ]
        return Response({"result": response})
