import { Autocomplete, Box, Button, Divider, TextField } from '@mui/material';
import { anyInsightObj, anyOptionsState, Hardware, option } from '../../utilities/interfaces';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { PrintModal } from './printModal';
import { PrinterOption } from '../../pages/single-edit/singleEdit';
import { Labels } from './labels';
import { configureOptions } from '../../utilities/utilities';
import { LoaderContext } from '../../App';

const customMapFunc = (item: anyInsightObj, index: number, itemType: string) => ({
  id: index,
  label: itemType === 'AD_User' ? `${item['ФИО']}, ${item.metroStoreNumber}, ${item.Email}` : item.Name,
  key: item.Key,
});

interface Props {
  item: Hardware;
  setItemToReload: React.Dispatch<React.SetStateAction<boolean | string>>;
  printerList: Array<PrinterOption>;
}

export function ItemCard({ item, setItemToReload, printerList }: Props) {
  const setLoading = useContext(LoaderContext);
  const [{ Store, Location, State, Unit_Eq, Pallets, AD_User, Department }, setLists] =
    useState<anyOptionsState>(() => ({
      Store: [],
      Location: [],
      State: [],
      Unit_Eq: [],
      Pallets: [],
      AD_User: [],
      Department: [],
    }));

  const [form, setForm] = useState<{ [key: string]: string | undefined }>({});

  const initialRequestData = [
    { itemType: 'Store', iql: '"Need_Inventory" = True' },
    { itemType: 'State', iql: '"Type" = Hardware' },
    { itemType: 'Unit_Eq', iql: '' },
    {
      itemType: 'AD_User',
      iql: `Status = Active AND ("Store Insight" IN (${item.Store}, 990, 1990, 1991) Or "Store Insight" IS EMPTY)`,
    },
    { itemType: 'Location', iql: `"Store" = "${item.Store}"` },
    { itemType: 'Pallets', iql: `"Store" = "${item.Store}" AND "State" != "To Discard"` },
    { itemType: 'Department', iql: '' },
  ];

  const followingRequestData = [
    { itemType: 'Location', iql: `"Store" = "${form.Store}"` },
    { itemType: 'Pallets', iql: `"Store" = "${form.Store}" AND "State" != "To Discard"` },
  ];

  useEffect(() => {
    setLoading(true);
    setForm({
      Store: item.Store,
      Location: item.Location,
      State: item.State,
      Unit_Eq: item.Unit_Eq,
      Pallet: item.Pallet,
      User: item.User,
      Department: item.Department,
      Description: item.Description,
    });

    Promise.all(initialRequestData.map((data) => configureOptions(data, setLists, customMapFunc))).then(() =>
      setLoading(false)
    );
  }, [item]);

  const handleStoreChange = (_event: React.SyntheticEvent<Element | Event>, value: option | null) => {
    setLoading(true);
    setForm((lastState) => ({ ...lastState, Store: value?.label, Location: '', Pallet: '' }));
    Promise.all(followingRequestData.map((data) => configureOptions(data, setLists))).then(() =>
      setLoading(false)
    );
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    // как без преобразований сразу хранить в стейте? никак, из-за проблем с непоследовательной
    // работой сетстейтов
    const data = {
      obj_key: item.Key,
      Description: form.Description,
      Store: Store.filter((obj) => obj.label === form.Store)[0]?.key || '', // undefined не передается
      Location: Location.filter((obj) => obj.label === form.Location)[0]?.key || '',
      State: State.filter((obj) => obj.label === form.State)[0]?.key || '',
      Unit_Eq: Unit_Eq.filter((obj) => obj.label === form.Unit_Eq)[0]?.key || '',
      Pallet: Pallets.filter((obj) => obj.label === form.Pallet)[0]?.key || '',
      User: AD_User.filter((obj) => form.User && obj.label.includes(form.User))[0]?.key || '', // если юзера не меняем, то
      // он записан в форме в коротком формате, если меняем, то в длинном: через === не будет находится короткий формат
      Department: Department.filter((obj) => obj.label === form.Department)[0]?.key || '',
    };

    axios.post('http://127.0.0.1:8000/single-edit/edit/', data).then(() => {
      setItemToReload(item['INV No']);
    });
  };

  const checkFormChanges = () => {
    for (const [key, value] of Object.entries(form)) {
      if (value !== item[key as keyof Hardware]) {
        return false;
      }
    }
    return true;
  };

  return (
    <form onSubmit={handleFormSubmit} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Labels item={item} />
      <Divider variant="middle" />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', rowGap: 2, justifyContent: 'space-between', p: 2 }}>
        <Autocomplete
          options={Store}
          sx={{ width: 0.32 }}
          renderInput={(params) => <TextField {...params} label="Store" required />}
          value={Store.filter((obj) => obj.label == form.Store)[0] || null}
          onChange={handleStoreChange}
        />
        <Autocomplete
          options={Location}
          sx={{ width: 0.32 }}
          renderInput={(params) => <TextField {...params} label="Location" required />}
          value={Location.filter((obj) => obj.label === form.Location)[0] || null}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, Location: value?.label }))}
        />
        <Autocomplete
          options={State}
          sx={{ width: 0.32 }}
          renderInput={(params) => <TextField {...params} label="State" required />}
          value={State.filter((obj) => obj.label === form.State)[0] || null}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, State: value?.label }))}
        />
        <Autocomplete
          options={Unit_Eq}
          sx={{ width: 0.32 }}
          renderInput={(params) => <TextField {...params} label="Unit_Eq" />}
          value={Unit_Eq.filter((obj) => obj.label === form.Unit_Eq)[0] || null}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, Unit_Eq: value?.label }))}
        />
        <Autocomplete
          options={Pallets}
          sx={{ width: 0.32 }}
          renderInput={(params) => <TextField {...params} label="Pallet" />}
          value={Pallets.filter((obj) => obj.label === form.Pallet)[0] || null}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, Pallet: value?.label }))}
        />
        <Autocomplete
          options={AD_User}
          sx={{ width: 0.32 }}
          renderInput={(params) => <TextField {...params} label="User" />}
          value={AD_User.filter((obj) => form.User && obj.label.includes(form.User))[0] || null}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, User: value?.label }))}
        />
        <Autocomplete
          options={Department}
          sx={{ width: 0.32 }}
          renderInput={(params) => <TextField {...params} label="Department" />}
          value={Department.filter((obj) => obj.label === form.Department)[0] || null}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, Department: value?.label }))}
        />
        <TextField
          label="Description"
          value={form.Description || ''}
          sx={{ width: 0.66 }}
          onChange={(event) => setForm((lastState) => ({ ...lastState, Description: event.target.value }))}
        />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          gap: 1,
          pr: 2,
          pb: 1,
        }}
      >
        <PrintModal printerList={printerList} item={item} />
        <Button type="submit" variant="contained" color="success" disabled={checkFormChanges()}>
          Отправить
        </Button>
      </Box>
    </form>
  );
}
