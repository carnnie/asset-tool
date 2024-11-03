import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export interface mBtn {
  text: string;
  type: string;
  to: string;
  roles: Array<string>;
}

type Props = {
  button: mBtn;
};

export function MenuButton({ button }: Props) {
  if (button.type === 'link') {
    return (
      <Link to={button.to}>
        <Button
          variant="contained"
          sx={{
            height: '6rem',
            width: '12rem',
            textAlign: 'center',
            margin: '0.5rem',
          }}
        >
          {button.text}
        </Button>
      </Link>
    );
  } else if (button.type === 'href') {
    return (
      <Button
        variant="contained"
        href={button.to}
        sx={{
          height: '6rem',
          width: '12rem',
          textAlign: 'center',
          margin: '0.5rem',
        }}
      >
        {button.text}
      </Button>
    );
  }
}
