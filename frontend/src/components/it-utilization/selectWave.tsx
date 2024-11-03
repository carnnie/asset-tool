import { Autocomplete, TextField } from '@mui/material';
import { WaveOption } from '../../pages/it-utilization/it-utilization';

interface Props {
  wavesList: Array<WaveOption>;
  setWave: React.Dispatch<React.SetStateAction<WaveOption | null>>;
  disabled: boolean;
}

export function SelectWave({ wavesList, setWave, disabled }: Props) {
  return (
    <Autocomplete
      options={wavesList}
      renderInput={(params) => <TextField {...params} label="Wave" />}
      onChange={(_, value) => setWave(value)}
      disabled={disabled}
      sx={{ width: 1 }}
    />
  );
}
