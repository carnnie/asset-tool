import { Autocomplete, Chip, TextField } from '@mui/material';
import { PalletOption } from '../../pages/it-utilization/it-utilization';
import { useState } from 'react';

interface Props {
  palletList: Array<PalletOption>;
  setPallets: React.Dispatch<React.SetStateAction<Array<PalletOption>>>;
  disabled: boolean;
}

export function SelectPallets({ palletList, setPallets, disabled }: Props) {
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete
      options={palletList}
      multiple
      limitTags={1}
      renderInput={(params) => <TextField {...params} label="Паллеты" />}
      renderTags={(tagValue, getTagProps) => {
        // регулирование длины тега
        return tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={index}
            sx={{ maxWidth: '220px !important' }}
            label={option.label}
          />
        ));
      }}
      inputValue={inputValue}
      onInputChange={(event, value, reason) => {
        // сохранение введенного текста при выборе
        if (event && event.type === 'blur') {
          setInputValue('');
        } else if (reason !== 'reset') {
          setInputValue(value);
        }
      }}
      disableCloseOnSelect
      onChange={(_, value) => setPallets(value)}
      disabled={disabled}
      sx={{ width: 1 }}
    />
  );
}
