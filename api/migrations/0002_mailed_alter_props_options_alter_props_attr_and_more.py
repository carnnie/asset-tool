# Generated by Django 5.0.1 on 2024-05-14 15:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Mailed',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.AlterModelOptions(
            name='props',
            options={'verbose_name': 'Атрибуты объектов', 'verbose_name_plural': 'Атрибуты объектов'},
        ),
        migrations.AlterField(
            model_name='props',
            name='attr',
            field=models.IntegerField(),
        ),
        migrations.CreateModel(
            name='InsightEntity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=64)),
                ('scheme', models.IntegerField()),
                ('type_id', models.IntegerField()),
                ('props', models.ManyToManyField(to='api.props')),
            ],
            options={
                'verbose_name': 'Схема обьекта в инсайт',
                'verbose_name_plural': 'Схема обьекта в инсайт',
            },
        ),
    ]
