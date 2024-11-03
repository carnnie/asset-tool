import axios from 'axios';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { Dispatch, SetStateAction, useState } from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularSpinner from '../../components/spinner';
import { Item } from './data';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});



export default function Notify({ invent, setShowNotify, items }: { invent: string; setShowNotify: Dispatch<SetStateAction<Boolean>>; items: Array<Item> }) {
  const [from, setFrom] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [cc, setCc] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [load, setLoad] = useState<Boolean>(false);
  const [files, setFiles] = useState<Array<File>>([]);
  // const [done, setDone] = useState<string>('');


  const chipFiles = (data: File) => {
    return (<Chip label={data.name.length > 10? `${data.name.slice(0, 4)}...${data.name.slice(-5)}` : data.name}  
                  onDelete={() => handleFiles(data)} 
                  sx={{margin: "2px"}}/>)
  }

  const handleFiles = (file: File) => {
    setFiles(files.filter(item => item !== file));
  }

  const addFiles = (newFiles: FileList | null) => {
    if (newFiles!==null){
      setFiles([...files, ...newFiles])
    }
  }


  const handelActionChange = async (action: string) => {
    setAction(action);
    setLoad(true);
    axios.post('/it-invent/notify/mails/', { invent: invent, action: action, items: items }).then((response) => {
      setTo(response.data.To);
      setCc(response.data.Cc);
      setBody(response.data.body.replace());
      setTitle(response.data.title);
      setFrom(response.data.From);
      setLoad(false);
    });
  };

  const handleSend = () => {
    var data = new FormData();
    data.append('From', from);
    data.append('To', to);
    data.append('Cc', cc)
    data.append('Subject', title);
    data.append('Body', body);
    files.map((file) => data.append('files', file));
    axios.post('/api/sendmail/', data)
    .then(() => {
      console.log(1);
      setShowNotify(false);
    });
  };

  return (
    <Box zIndex={1500} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '5%', position: 'absolute', left: 'calc(50% - 450px)' }}>
      <IconButton aria-label="close" sx={{ position: 'absolute', right: '5px', top: '10%' }} onClick={() => setShowNotify(false)}>
        <CloseIcon fontSize="inherit" />
      </IconButton>
      <Grid container spacing={2} sx={{ width: '900px', padding: 1, borderRadius: 2, backgroundColor: 'white' }} boxShadow={2}>
        <Grid xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
          <FormControlLabel
            labelPlacement="top"
            label={'Open'}
            control={<Radio size="small" value={'open'} checked={action == 'open'} onChange={(event) => handelActionChange(event.target.value)} />}
          />

          <FormControlLabel
            labelPlacement="top"
            label={'Start'}
            control={<Radio size="small" value={'start'} checked={action == 'start'} onChange={(event) => handelActionChange(event.target.value)} />}
          />
          <FormControlLabel
            labelPlacement="top"
            label={'Mobile'}
            control={<Radio size="small" value={'mobile'} checked={action == 'mobile'} onChange={(event) => handelActionChange(event.target.value)} />}
          />
          <FormControlLabel
            labelPlacement="top"
            label={'Close'}
            control={<Radio size="small" value={'close'} checked={action == 'close'} onChange={(event) => handelActionChange(event.target.value)} />}
          />
        </Grid>
        <Grid xs={2}>
          <Button color={'secondary'} sx={{ height: '100%', width: '100%' }} onClick={handleSend}>
            Send <ForwardToInboxIcon sx={{ padding: 1 }} />
          </Button>
        </Grid>
        <Grid xs={10} container>
          <Grid xs={2}>
            <Typography textAlign={'center'} variant="subtitle1">
              From:
            </Typography>
          </Grid>
          <Grid xs={10}>
            <TextField fullWidth size="small" variant="standard" value={from} disabled />
          </Grid>
          <Grid xs={2}>
            <Typography textAlign={'center'} variant="subtitle1">
              To:
            </Typography>
          </Grid>
          <Grid xs={10}>
            <TextField fullWidth size="small" variant="standard" multiline value={to} onChange={(event) => setTo(event.target.value)} />
          </Grid>
          <Grid xs={2}>
            <Typography textAlign={'center'} variant="subtitle1">
              Cc:
            </Typography>
          </Grid>
          <Grid xs={10}>
            <TextField fullWidth size="small" variant="standard" multiline value={cc} onChange={(event) => setCc(event.target.value)} />
          </Grid>
        </Grid>

        <Grid xs={12} pt={1}>
          <TextField id="msg-title" value={title} size="small" fullWidth onChange={(evetn) => setTitle(evetn.target.value)} />
        </Grid>
        <Grid item xs={10}>
          {files.map(item => chipFiles(item))}
      </Grid>
        <Grid item xs={2}>
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
          >
            Файлы
            <VisuallyHiddenInput
              type="file"
              onChange={(event) => addFiles(event.target.files)}
              multiple
            />
          </Button>
        </Grid>
        <Grid xs={12} pt={1}>
          <TextField id="msg-body" value={body} rows={25} multiline fullWidth onChange={(evetn) => setBody(evetn.target.value)} />
        </Grid>
      </Grid>
      {load && <CircularSpinner />}
    </Box>
  );
}
