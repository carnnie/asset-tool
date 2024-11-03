import { Backdrop, CircularProgress, useTheme } from '@mui/material';

function CircularSpinner() {
  return (
    <CircularProgress
      size={'10vh'}
      sx={{ position: 'absolute', top: '45vh', left: '-5vh', marginLeft: '50%' }}
    />
  );
}

export function Loader({ loading }: { loading: boolean }) {
  const theme = useTheme();
  return (
    <Backdrop open={loading} sx={{ zIndex: Math.max(...Object.values(theme.zIndex)) + 1 }}>
      <CircularSpinner />
    </Backdrop>
  );
}
