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
import { LoaderContext } from '../../App';
import { FieldData } from '../../pages/facility-invent/facilityInvent';

interface Props {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  fields: Array<FieldData>;
}

const iqls = {
  Store: '"Need_Inventory" = True',
  AD_User: 'Status = Active',
};

export function CreateModal({ openModal, setOpenModal, fields }: Props) {
  const setLoading = useContext(LoaderContext);
  const [lists, setLists] = useState<anyOptionsState>({});
  const [form, setForm] = useState<{ [key: string]: string | undefined }>({});

  console.log(lists)

  const editableFields = fields.filter((field) => !['Key', 'Created', 'Updated'].includes(field.name));
  const listFields = editableFields.filter((f) => f.ref);

  useEffect(() => {
    setLists(listFields.reduce((prev, cur) => ({ ...prev, [cur.ref]: [] }), {}));
  }, [fields]);

  useEffect(() => {
    if (Object.keys(lists).length) {
      const requestData = listFields.map((field) => ({
        itemType: field.ref,
        iql: iqls[field.ref as keyof typeof iqls] || '',
      }));

      Promise.all(requestData.map((data) => configureOptions(data, setLists))).then(() => setLoading(false));
    }
    поле Name везде разное
  }, [Object.keys(lists).length]);

  const get_field = (field, index) => {
    switch (field.type) {
      case 'Textfield':
        return (
          <TextField
            key={index}
            label={field.name}
            sx={{ width: 1 }}
            // onChange={(event) => setDescription(event.target.value)}
          />
        );
      case 'Reference':
        return (
          <Autocomplete
            key={index}
            options={lists[field.ref] || []}
            renderInput={(params) => <TextField {...params} label={field.name} />}
            // onChange={(_, value) => setForm((lastState) => ({ ...lastState, Location: value?.key }))}
            sx={{ width: 0.4 }}
            // disabled={!form.Store}
            // value={Location.filter((obj) => obj.key == form.Location)[0] || null}
          />
        );
      default:
        return <div>Пока не проработано</div>;
    }
  };

  const handleClose = () => {
    // setForm({});
    // setRadio('');
    // setDescription('');
    setOpenModal(false);
  };

  const handleEdit = () => {
    setLoading(true);
  };

  return (
    <Dialog open={openModal} onClose={handleClose} fullWidth>
      <DialogTitle>Создание нового объекта</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: '5px !important' }}>
        {editableFields.map((field, index) => get_field(field, index))}
        {/* убрать вложенную функцию */}
        <Button
          variant="contained"
          color="success"
          onClick={handleEdit}
          disabled={!Object.values(form).filter((v) => v).length}
        >
          Редактировать
        </Button>
      </DialogContent>
    </Dialog>
  );
}
