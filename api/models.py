from django.db import models
from asgiref.sync import sync_to_async
import subprocess
import logging

logger = logging.getLogger("main")
PRINT_SERVER = "MOW30VPRS403"


# Create your models here.
class Printer(models.Model):
    name = models.CharField(max_length=64, blank=False, null=False, unique=True)
    ip = models.CharField(max_length=24, blank=False, null=False)
    location = models.CharField(max_length=64, blank=False, null=False)
    share_name = models.CharField(max_length=64, blank=False, null=False)

    def update_all(self):
        command = f"Get-Printer -ComputerName {PRINT_SERVER}"
        printer_list = subprocess.Popen(
            ["powershell.exe", f"{command}| Format-List"], stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
        out, err = printer_list.communicate()
        printer_list = out.decode("cp437").replace("\r\n", ",").split(",,")
        printer_list = [lst.split("SeparatorPageFile")[0] for lst in printer_list if lst]
        for printer in printer_list:
            name = ""
            self.objects.update_or_create(name=name, defaults={})


class LabelTemplates(models.Model):
    """нейминг нарушен ради совпадения полей с инсайт"""

    Name = models.CharField(max_length=64, blank=False, null=False)
    ZPL_Text = models.CharField(max_length=64, blank=False, null=False)
    Label_App = models.CharField(max_length=64, blank=False, null=False)
    Label_ID = models.CharField(max_length=64, blank=False, null=False)
    Label_Type = models.CharField(max_length=64, blank=False, null=False)

    class Meta:
        verbose_name = "LabelTemplate"
        verbose_name_plural = "LabelTemplates"

    def __str__(self) -> str:
        return str(self.Name)

    @classmethod
    def update(cls) -> None:
        from logic.MARS import mars_insight

        fields = []
        labels = mars_insight.search(item_type="LabelTemplates")
        for label in labels:
            if all([attr in label.keys() for attr in ("Name", "Label_App", "Label_ID", "Label_Type")]):
                new_one, _ = cls.objects.get_or_create(
                    Name=label["Name"],
                    Label_App=label["Label_App"],
                    Label_ID=label["Label_ID"],
                    Label_Type=label["Label_Type"],
                )
            if "ZPL_Text" in label.keys():
                new_one.ZPL_Text = label["ZPL_Text"]
                new_one.save()


class InsightEntity(models.Model):
    """
    Создаем модель с полями name, schema, type_id
    После подгружаем Props через load_entity()

    """

    name = models.CharField(max_length=64, blank=False, null=False)
    schema = models.IntegerField(blank=False, null=False)
    type_id = models.IntegerField(blank=False, null=False)
    # props = models.ManyToManyField(to='Props')

    class Meta:
        verbose_name = "Схема обьекта в инсайт"
        verbose_name_plural = "Схема обьекта в инсайт"

    @property
    def fields(self):
        return {prop.attr: prop.field for prop in self.props.all()}

    async def afields(self):
        """Асинхронный аналог property(fields)"""
        props = []
        async for prop in self.props.all():
            props.append(prop)
        return {prop.attr: prop.field for prop in props}

    @property
    def reversed_fields(self):
        return {prop.field: prop.attr for prop in self.props.all()}

    @classmethod
    def check_type_id(cls, type_id):
        return bool(cls.objects.get(type_id=type_id))

    def __str__(self) -> str:
        return str(self.name)

    def load_entity(self):
        from logic.MARS import mars_insight

        response = mars_insight.insight.object_run(type_id=self.type_id, scheme=self.schema)
        with open("1.txt", "w") as f:
            import pprint

            pprint.pprint(response, f)
        props = []
        for attr in response:
            prop, created = Props.objects.get_or_create(attr=attr["id"])
            if created and prop.field != attr["name"]:
                prop.field = attr["name"]
                prop.save()
            props.append(prop)
        self.props.set(props)
        self.save()


class Mailed(models.Model):
    pass


class PropsTypes(models.Model):
    name = models.CharField(max_length=64, blank=False, null=False, unique=True)

    class Meta:
        verbose_name = "Типы атрибутов"
        verbose_name_plural = "Типы атрибутов"

    def __str__(self) -> str:
        return self.name


class Props(models.Model):
    attr = models.IntegerField(null=False, blank=False)
    field = models.CharField(max_length=64, blank=False, null=False)
    referenced = models.ForeignKey(
        to=InsightEntity, on_delete=models.CASCADE, null=True, blank=True, related_name="props"
    )
    type = models.ForeignKey(to=PropsTypes, on_delete=models.CASCADE, null=True, blank=True, related_name="types")
    value_referenced = models.ForeignKey(
        to=InsightEntity, on_delete=models.CASCADE, null=True, blank=True, related_name="references"
    )

    class Meta:
        verbose_name = "Атрибуты объектов"
        verbose_name_plural = "Атрибуты объектов"

    def __str__(self) -> str:
        return f"{self.field} [{str(self.attr)}]"
