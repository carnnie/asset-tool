import CircularProgress from '@mui/material/CircularProgress';

export default function CircularSpinner() {
  return (
    <CircularProgress
      size={'10vh'}
      sx={{
        position: 'absolute',
        top: '45vh',
        left: '-5vh',
        marginLeft: '50%',
      }}
    />
  );
}
