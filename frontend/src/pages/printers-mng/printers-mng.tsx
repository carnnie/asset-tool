import * as React from 'react';

import axios from 'axios';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Printer = {
  pk: number;
  name: string;
  ip: string;
}


function Card({printer, printers, setPrinters, state}: {printer: Printer, printers: Array<Printer>, setPrinters: Function, state: Function}) {
  const [name, setName] = React.useState<string>(printer.name);
  const [ip, setIp] = React.useState<string>(printer.ip);
  const [nameError, setNameError] = React.useState<string|null>(null)

  const handleCreate = () => {
    axios.post(`https://asset-tool.metro-cc.ru/api/printer/run/`, {name: name, ip: ip})
    .then((response) => {
      setPrinters([...printers, response.data].sort((a,b) => a.name > b.name ? 1 : -1))
    })
  }
  const handleEdit = () => {
    axios.put(`https://asset-tool.metro-cc.ru/api/printer/run/${printer.pk}/`, {name: name, ip: ip})
    .then((response) => {
      setPrinters(printers.map(printer => printer.pk != response.data.pk? printer: response.data)) 
    })
  }

  const handleDelete = () => {
    axios.delete(`https://asset-tool.metro-cc.ru/api/printer/run/${printer.pk}/`)
    .then((_) => {
      setPrinters(printers.filter(p => printer != p))
    })
  }

  const handleName = (name: string) => {
    if (printers.filter((printer) => name === printer.name).length && printer.name !== name) {
      setNameError("Имя не уникально");
    } else {
      setNameError(null)
      setName(name)
    }
  }
  return (
    <Box zIndex={1500} 
          boxShadow={3}
          sx={{
            position: 'absolute',
            width: '500px',
            marginLeft: '50%',
            left: '-250px',
            marginTop: '30vh',
            background: 'white',
            padding: "20px",
          }}>
      <Grid container spacing={2} sx={{width: "100%", paddingTop: "20px"}}>
        <Grid item xs={10}>
          <TextField id="name" fullWidth size={"small"} label="name" defaultValue={printer.name} variant="outlined" onChange={(event) => handleName(event.target.value)}/>
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" onClick={printer.pk? handleEdit: handleCreate}>{printer.pk?"Update":"Create"}</Button>
        </Grid>
        <Grid item xs={10}>
        <TextField id="ip" fullWidth size={"small"} label="ip" defaultValue={printer.ip} variant="outlined" onChange={(event) => setIp(event.target.value)}/>
        </Grid>
        <Grid item xs={2}>  
          <Button variant="contained" onClick={handleDelete} color="error">Delete</Button>
        </Grid>
        <Grid item xs={12}>
          {nameError !== null && 
          <Typography variant="overline" gutterBottom sx={{ display: 'block' }} color="error" textAlign="center">{nameError}</Typography>
          }
        </Grid>
      </Grid>

      <IconButton color="primary" size='small' onClick={() => state(null)} sx={{ position: 'absolute', left: '510px' , top: '0'}}>
        <CloseIcon fontSize='inherit' />
      </IconButton>
    </Box>
  )

}

export default function PrintersMng() {
  const [printers, setPrinters] = React.useState<Array<Printer>>([]);
  const [toTable, setToTable] = React.useState<Array<Printer>>([]);
  const [printer, setPrinter] = React.useState<Printer>();
  const [search, setSearch] = React.useState<string>('');
  
  
  React.useEffect(() => {
    axios.get('/api/printer/run/')
      .then((response) => {
        const res = response.data as Array<Printer>
        const data: Array<Printer> = new Array(...Object.values(res))
        setPrinters(data);
      })
     
  }, [])
  React.useEffect(() => {
    if (search) {
      setToTable(printers.filter((printer) => (printer.name.includes(search) || printer.ip.includes(search))))
    }
    setToTable(printers)
  }, [printers])



  const handleSearch = (value: string) => {
    setSearch(value)
    setToTable(printers.filter((printer) => (printer.name.includes(value) || printer.ip.includes(value))))
  }


return (
    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap',  mx: 'auto', width: "72%", padding: "5vh 0" }}> 
    <TextField id="search" 
    size={"small"} variant="standard" 
    onChange={(event) => handleSearch(event.target.value)} 
    fullWidth placeholder='Search'
    inputProps={{min: 0, style: { textAlign: 'center' }}}/>
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650}} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">IP</TableCell>
            <TableCell align="right" sx={{padding: 0, width: '10px'}}>
              <IconButton color="primary" size='small' onClick={() => setPrinter(undefined)}>
                <AddCircleIcon fontSize='inherit' color='success'/>
              </IconButton>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {toTable.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0}}}
            >
              <TableCell component="th" scope="row">{row.name}</TableCell>
              <TableCell align="right">{row.ip}</TableCell>
              <TableCell align="right"sx={{padding: 0, width: '10px'}}>
                <IconButton color="primary" size='small' onClick={() => setPrinter(row)}>
                  <EditIcon fontSize='inherit' />
                </IconButton>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    {printer && <Card printer={printer} printers={printers} setPrinters={setPrinters} state={setPrinter}/>}
    </Box>
  );
}
