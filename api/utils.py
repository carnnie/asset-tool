from .models import InsightEntity

def load_entity():
    ''' Восстановление базы с 0'''
    objects_to_load = {
        "Hardware": {"schema": 1,'type_id': 8},
        "E-Requests": {"schema": 1,'type_id': 78},
        "Store": {"schema": 1,'type_id': 16},
        "Location": {"schema": 1,'type_id': 17},
        "State": {"schema": 1,'type_id': 60},
        "Unit_Eq": {"schema": 1,'type_id': 21},
        "Pallets": {"schema": 1,'type_id': 120},
        "Inventory_IT": {"schema": 1, 'type_id': 225},
        "InventoryCard": {"schema": 1, 'type_id': 226},
        "Type": {"schema": 1, 'type_id': 18},
        "AD_User": {"schema": 2, 'type_id': 57},
        "Model": {"schema": 1, 'type_id': 19},
        "Department": {"schema": 1, 'type_id': 19},
        #printers
        "PrinterMask": {"schema": 1, 'type_id': 236},
        "LabelTemplates": {"schema": 1, 'type_id': 234},
        # test
        "InventoryTest": {"schema": 10, 'type_id': 229},
        "InventoryCardTest": {"schema": 10, 'type_id': 230},
        "StoreTest": {"schema": 10, 'type_id': 173},
        "HardwareTest": {"schema": 10, 'type_id': 155},
    }
    for key, value in objects_to_load.items():
        print(f'{key}',end='')
        entity, created = InsightEntity.objects.get_or_create(name=key, schema=value['schema'], type_id=value['type_id'])
        if created:
            print(f'\tcreated')
            entity.load_entity()
            print(f'\t...{', '.join([str(field) for field in entity.props.all()])}')