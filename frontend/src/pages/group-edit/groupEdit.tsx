import { Box } from '@mui/material';
import { MenuDrawer } from '../../components/group-edit/drawer';
import { createContext, useContext, useEffect, useState } from 'react';
import { GroupEditTable } from '../../components/group-edit/table';
import { anyOptionsState, Hardware, editData } from '../../utilities/interfaces';
import { CompleteModal } from '../../components/it-utilization/completeModal';
import { configureOptions } from '../../utilities/utilities';
import { LoaderContext } from '../../App';

const context = {
  Store: [],
  State: [],
  Type: [],
  Department: [],
  Model: [],
  Unit_Eq: [],
};

export const ListsContext = createContext<anyOptionsState>(context);

export function GroupEdit() {
  const setLoading = useContext(LoaderContext);
  const [lists, setLists] = useState<anyOptionsState>(context);

  const [items, setItems] = useState<Array<Hardware>>([]);
  const [checkedItems, setCheckedItems] = useState<Array<Hardware>>([]);

  const [openCompleteModal, setOpenCompleteModal] = useState(false);

  const [editData, setEditData] = useState<editData>({});

  const initialRequestData = [
    { itemType: 'Store', iql: '"Need_Inventory" = True' },
    { itemType: 'State', iql: '"Type" = Hardware' },
    { itemType: 'Type', iql: '"ServiceType" = Hardware' },
    { itemType: 'Department', iql: '' },
    {
      itemType: 'Model',
      iql: `object HAVING outboundReferences(objectType = Type AND "ServiceType" = Hardware 
            AND "ServiceType" != Software) AND "Model_Active" = True`,
      orderField: 'Type',
    },
    { itemType: 'Unit_Eq', iql: '' },
  ];

  useEffect(() => {
    setLoading(true);
    Promise.all(initialRequestData.map((data) => configureOptions(data, setLists))).then(() => {
      setLoading(false);
    });
  }, []);

  return (
    <ListsContext.Provider value={lists}>
      <Box sx={{ display: 'flex' }}>
        <MenuDrawer
          items={items}
          setItems={setItems}
          checkedItems={checkedItems}
          setOpenCompleteModal={setOpenCompleteModal}
          editData={editData}
          setEditData={setEditData}
        />
        <GroupEditTable items={items} setCheckedItems={setCheckedItems} setEditData={setEditData} />
        <CompleteModal
          openModal={openCompleteModal}
          setOpenModal={setOpenCompleteModal}
          text="Оборудование отредактировано!"
        />
      </Box>
    </ListsContext.Provider>
  );
}
