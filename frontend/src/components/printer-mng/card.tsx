import * as React from 'react';

import axios from 'axios';


import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';


import { Printer } from './data'

export default function Card({printer, printers, setPrinters, state}: {printer: Printer, printers: Array<Printer>, setPrinters: Function, state: Function}) {
    const [name, setName] = React.useState<string>(printer.name);
    const [ip, setIp] = React.useState<string>(printer.ip);
    const [nameError, setNameError] = React.useState<string|null>(null)
  
    
  
    const handleEdit = () => {
        if (printer.pk) {
            axios.put(`/api/printer/run/${printer.pk}/`, {name: name, ip: ip})
        } else {
            axios.post(`/api/printer/run/`, {name: name, ip: ip})       
        }
    }
    const handleDelete = () => {
      axios.delete(`/api/printer/run/${printer.pk}/`)
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
      <>
      
        <IconButton color="primary" size='small' onClick={() => state(null)}>
          <CloseIcon fontSize='inherit' />
        </IconButton>
        <TextField id="name" size={"small"} label="name" defaultValue={printer.name} variant="outlined" onChange={(event) => handleName(event.target.value)}/>
        <TextField id="ip" size={"small"} label="ip" defaultValue={printer.ip} variant="outlined" onChange={(event) => setIp(event.target.value)}/>
        {nameError !== null && nameError}
        <Button variant="contained" onClick={handleDelete} color="error">Delete</Button>
        <Button variant="contained" onClick={handleEdit}>{printer.pk?"Update":"Create"}</Button>
      </>
    )
  
  }