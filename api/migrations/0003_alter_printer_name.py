# Generated by Django 5.0.1 on 2024-05-15 08:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_mailed_alter_props_options_alter_props_attr_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='printer',
            name='name',
            field=models.CharField(max_length=64, unique=True),
        ),
    ]
