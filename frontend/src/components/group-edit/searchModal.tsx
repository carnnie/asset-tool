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
  setItems: React.Dispatch<React.SetStateAction<Array<Hardware>>>;
}

export function SearchModal({ openModal, setOpenModal, setLoading, setItems }: Props) {
  const { Store, State, Type, Department, Model } = useContext(ListsContext);
  const [{ Location }, setLocations] = useState<anyOptionsState>({ Location: [] });

  const [form, setForm] = useState<{ [key: string]: string | undefined }>({});
  const [numbers, setNumbers] = useState('');
  const [radio, setRadio] = useState('Inv No');
  const theme = useTheme();

  const requestData = { itemType: 'Location', iql: `"Store" = ${form.Store}` };

  useEffect(() => {
    setForm((lastState) => ({ ...lastState, Location: '' }));
    if (form.Store) {
      setLoading(true);
      configureOptions(requestData, setLocations).then(() => {
        setLoading(false);
      });
    }
  }, [form.Store]);

  const handleClose = () => {
    setForm({});
    setNumbers('');
    setOpenModal(false);
  };

  const handleSearch = () => {
    setLoading(true);
    axios.post('http://127.0.0.1:8000/group-edit/search/', { ...form, [radio]: numbers }).then((response) => {
      setItems(response.data.result);
      handleClose();
      setLoading(false);
    });
  };

  return (
    <Dialog open={openModal} onClose={handleClose} fullWidth>
      <DialogTitle>Поиск по атрибутам</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <RadioGroup row value={radio} onChange={(event) => setRadio(event.target.value)}>
          <FormControlLabel
            value="Inv No"
            control={<Radio />}
            label="Inv No"
            sx={{ color: radio === 'Inv No' ? theme.palette.primary.main : '' }}
          />
          <FormControlLabel
            value="Serial No"
            control={<Radio />}
            label="Serial No"
            sx={{ color: radio === 'Serial No' ? theme.palette.primary.main : '' }}
          />
        </RadioGroup>
        <TextField label={radio} sx={{ width: 1 }} onChange={(event) => setNumbers(event.target.value)} />
        <Autocomplete
          options={Store}
          renderInput={(params) => <TextField {...params} label="Store" />}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, Store: value?.label }))}
          sx={{ width: 0.4 }}
        />
        <Autocomplete
          options={Type}
          renderInput={(params) => <TextField {...params} label="Type" />}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, Type: value?.label }))}
          sx={{ width: 0.4 }}
        />
        <Autocomplete
          options={Model}
          renderInput={(params) => <TextField {...params} label="Model" />}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, Model: value?.label }))}
          sx={{ width: 0.4 }}
        />
        <Autocomplete
          options={Location}
          renderInput={(params) => <TextField {...params} label="Location" />}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, Location: value?.label }))}
          sx={{ width: 0.4 }}
          disabled={!form.Store}
          value={Location.filter((obj) => obj.label == form.Location)[0] || null}
        />
        <Autocomplete
          options={Department}
          renderInput={(params) => <TextField {...params} label="Department" />}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, Department: value?.label }))}
          sx={{ width: 0.4 }}
        />
        <Autocomplete
          options={State}
          renderInput={(params) => <TextField {...params} label="State" />}
          onChange={(_, value) => setForm((lastState) => ({ ...lastState, State: value?.label }))}
          sx={{ width: 0.4 }}
        />
        <TextField
          label="Description"
          sx={{ width: 1 }}
          onChange={(event) => setForm((lastState) => ({ ...lastState, Description: event.target.value }))}
        />
        <Button
          variant="contained"
          color="success"
          onClick={handleSearch}
          disabled={!(Object.values(form).filter((v) => v).length || numbers)}
        >
          Поиск
        </Button>
      </DialogContent>
    </Dialog>
  );
}
