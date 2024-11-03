import axios from 'axios';
import { Alert } from '@mui/material';
import Button from '@mui/material/Button';
type Props = {
  text: string;
  data: Map<string, string | null>;
  setAlert: Function;
};

export default function NotificationWithButton({ text, data, setAlert }: Props) {
  const handleReport = () => {
    axios.post('/', { data: data });
    setAlert(false);
  };
  return (
    <Alert
      severity="error"
      style={{ position: 'absolute', bottom: '15%' }}
      action={
        <Button size={'small'} variant="text" onClick={handleReport} color="inherit">
          Cообщить о проблеме
        </Button>
      }
    >
      {text}
    </Alert>
  );
}
