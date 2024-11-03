import { Box, Button, IconButton, Typography } from '@mui/material';
import { MenuDrawer } from '../../components/facility-invent/drawer';
import { FacilitiesTable } from '../../components/facility-invent/table';
import { useContext, useEffect, useState } from 'react';
import { Hardware } from '../../utilities/interfaces';
import { CreateModal } from '../../components/facility-invent/createModal';

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { LoaderContext } from '../../App';
import axios from 'axios';

export interface FieldData {
  name: string;
  type: string;
  ref: string;
}

export function FacilityInvent() {
  const setLoading = useContext(LoaderContext);
  const [items, setItems] = useState<Array<Hardware>>([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const [checkedItems, setCheckedItems] = useState<Array<Hardware>>([]);

  const [objectType, setObjectType] = useState('Facility_FA');
  const [fields, setFields] = useState([]);
  const objTypes = [
    'FA_Model',
    'FA_Status',
    'FA_Region',
    'FA_ServiceCompany',
    'FA_Brand',
    'FA_TechnicalSystem',
    'Facility_FA',
    'Scheduled_Repair',
    'Unscheduled_Repair',
    'Inventory_Facility',
    'Inventory_card_Facility',
  ];

  useEffect(() => {
    setLoading(true);
    axios.post('http://127.0.0.1:8000/iql/', { itemType: objectType, iql: '' }).then((response) => {
      setItems(response.data.result);
      axios
        .post('http://127.0.0.1:8000/facility-invent/fields/', { objectType: objectType })
        .then((response) => {
          console.log(response.data.result);
          setFields(response.data.result);
          setLoading(false);
        });
    });
  }, [objectType]);

  return (
    <Box sx={{ display: 'flex' }}>
      <MenuDrawer
        objTypes={objTypes}
        objectType={objectType}
        setObjectType={setObjectType}
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
      />
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Box sx={{ m: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton
            onClick={() => setOpenDrawer(!openDrawer)}
            sx={{
              borderRadius: 0,
            }}
          >
            {openDrawer ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
          </IconButton>
          <Typography variant="h5">{objectType}</Typography>
          <Button variant="contained" color="success" size="small" onClick={() => setOpenCreateModal(true)}>
            Создать объект
          </Button>
          {/* <CreateModal openModal={openCreateModal} setOpenModal={setOpenCreateModal} fields={fields} /> */}
        </Box>
        <FacilitiesTable items={items} setCheckedItems={setCheckedItems} fields={fields} />
      </Box>
    </Box>
  );
}
