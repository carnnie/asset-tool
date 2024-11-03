import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  useTheme,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { configureOptions } from '../../utilities/utilities';
import { anyOptionsState, Hardware } from '../../utilities/interfaces';
import axios from 'axios';
import { ListsContext } from '../../pages/group-edit/groupEdit';

interface Props {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  checkedItems: Array<Hardware>;
  items: Array<Hardware>;
  setItems: React.Dispatch<React.SetStateAction<Array<Hardware>>>;
  setOpenCompleteModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export function EditModal({
  openModal,
  setOpenModal,
  setLoading,
  checkedItems,
  items,
  setItems,
  setOpenCompleteModal,
}: Props) {
  const { Store, State, Unit_Eq } = useContext(ListsContext);
  const [{ Location, Pallets }, setLists] = useState<anyOptionsState>(() => ({
    Location: [],
    Pallets: [],
  }));
  const [form, setForm] = useState<{ [key: string]: string | undefined }>({});
  const [description, setDescription] = useState('');
  const [radio, setRadio] = useState('');
  const theme = useTheme();

  const requestData = [
    { itemType: 'Location', iql: `"Store" = ${form.Store}` },
    { itemType: 'Pallets', iql: `"Store" = ${form.Store} AND State != "To Discard"` },
  ];

  useEffect(() => {
    setForm((lastState) => ({ ...lastState, Location: '', Pallet: '' }));
    if (form.Store) {
      setLoading(true);
      Promise.all(requestData.map((data) => configureOptions(data, setLists))).then(() => {
        setLoading(false);
      });
    }
  }, [form.Store]);

  const handleClose = () => {
    setForm({});
    setRadio('');
    setDescription('');
    setOpenModal(false);
  };

  const handleEdit = () => {
    setLoading(true);
    axios
      .post('http://127.0.0.1:8000/group-edit/edit/', { ...form, [radio]: description, items: checkedItems })
      .then((response) => {
        console.log(response);
        handleClose();
        axios
          .post('http://127.0.0.1:8000/iql/', {
            itemType: 'Hardware',
            iql: `"Key" IN (${items.map((item) => item.Key).join(', ')})`,
          })
          .then((response) => {
            setItems(response.data.result);
            handleClose();
            setLoading(false);
            setOpenCompleteModal(true);
          });
      });
  };

  return (
    <Dialog open={openModal} onClose={handleClose} fullWidth>
      <DialogTitle>Редактирование атрибутов</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: '5px !important' }}>
        <Autocomplete
          options={Store}
          renderInput={(params) => <TextField {...params} label="Store" />}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, Store: value?.key }))}
          sx={{ width: 0.4 }}
        />
        <Autocomplete
          options={Location}
          renderInput={(params) => <TextField {...params} label="Location" />}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, Location: value?.key }))}
          sx={{ width: 0.4 }}
          disabled={!form.Store}
          value={Location.filter((obj) => obj.key == form.Location)[0] || null}
        />
        <Autocomplete
          options={State}
          renderInput={(params) => <TextField {...params} label="State" />}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, State: value?.key }))}
          sx={{ width: 0.4 }}
        />
        <Autocomplete
          options={Unit_Eq}
          renderInput={(params) => <TextField {...params} label="Unit_Eq" />}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, Unit_Eq: value?.key }))}
          sx={{ width: 0.4 }}
        />
        <Autocomplete
          options={Pallets}
          renderInput={(params) => <TextField {...params} label="Pallet" />}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, Pallet: value?.key }))}
          sx={{ width: 0.4 }}
          disabled={!form.Store}
          value={Pallets.filter((obj) => obj.key == form.Pallet)[0] || null}
        />
        <TextField
          label="Description"
          sx={{ width: 1 }}
          onChange={(event) => setDescription(event.target.value)}
          disabled={!radio}
        />
        <RadioGroup row value={radio} onChange={(event) => setRadio(event.target.value)}>
          <FormControlLabel
            value="rewrite"
            control={<Radio />}
            label="Перезаписать описание"
            sx={{ color: radio === 'rewrite' ? theme.palette.primary.main : '' }}
          />
          <FormControlLabel
            value="add"
            control={<Radio />}
            label="Добавить в описание"
            sx={{ color: radio === 'add' ? theme.palette.primary.main : '' }}
          />
        </RadioGroup>
        <Button
          variant="contained"
          color="success"
          onClick={handleEdit}
          disabled={!(Object.values(form).filter((v) => v).length || description)}
        >
          Редактировать
        </Button>
      </DialogContent>
    </Dialog>
  );
}
