import { useEffect, useState, ChangeEvent } from 'react';
import { Item, filterItems } from './data';
import CircularSpinner from '../../components/spinner';
// MUI
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import { IconButton } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';

type Props = {
  parent_items: Array<Item>;
  fields: Map<string, boolean>;
  toPrint: Set<Item>;
  setParentResults: Function;
  setParentToPrint: Function;
};

export default function ItemsTable({ parent_items, fields, setParentResults, toPrint, setParentToPrint }: Props) {
  const [items, setItems] = useState<Array<Item>>(parent_items);
  const [filter, setFilter] = useState<Map<string, Array<string>>>(new Map([]));
  const [sortedOrder, setOrderBy] = useState<Set<string>>(new Set([]));
  const [load, setLoad] = useState<boolean>(false);

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.target.value) {
      filter.set(event.target.id, event.target.value.split('&'));
    } else {
      filter.delete(event.target.id);
    }
    setFilter(new Map(filter));
  };

  const handelSort = (key: string) => {
    if (sortedOrder.has(key)) {
      items.sort((a, b) => (a[key] > b[key] ? 0 : -1));
      sortedOrder.delete(key);
    } else {
      items.sort((a, b) => (a[key] < b[key] ? 0 : -1));
      sortedOrder.add(key);
    }
    setOrderBy(sortedOrder);
    setItems([...items]);
  };
  const handleToPrint = (item: Item) => {
    const tmp = new Set(toPrint);
    if (tmp.has(item)) {
      tmp.delete(item);
    } else {
      tmp.add(item);
    }
    setParentToPrint(tmp);
  };
  const getPrintButton = (item: Item) => {
    if (toPrint.has(item)) {
      return (
        <IconButton onClick={() => handleToPrint(item)} sx={{ color: 'red' }}>
          <ClearIcon />
        </IconButton>
      );
    } else {
      return (
        <IconButton onClick={() => handleToPrint(item)}>
          <AddIcon />
        </IconButton>
      );
    }
  };

  useEffect(() => {
    const tmpF = new Map();
    setFilter(tmpF);
  }, [parent_items]);

  useEffect(() => {
    setLoad(true);
    let tmp = filterItems(parent_items, filter);
    setItems(tmp);
    setParentResults(tmp.length);
    setLoad(false);
  }, [fields, filter, parent_items]);

  return (
    <Box width={'100%'}>
      {load && <CircularSpinner />}
      {parent_items.length != 0 && (
        <TableContainer sx={{ marginTop: '2vh', width: '100%' }}>
          <Table aria-label="simple table" size="small">
            <TableHead >
              <TableRow>
                {fields &&
                  [...fields.keys()].map((key) => {
                    if (fields.get(key)) {
                      if (key !== 'Print') {
                        return (
                          <TableCell sx={{padding:'0px'}}>
                            <TextField
                              fullWidth
                              id={key}
                              value={filter.has(key) ? filter.get(key)?.join("&") : ''}
                              label={key}
                              variant="standard"
                              size="small"
                              onChange={(event) => handleFilterChange(event)}
                              InputProps={{
                                endAdornment: (
                                  <IconButton sx={{ position: 'absolute', right: '0%' }} onClick={() => handelSort(key)}>
                                    <SwapVertIcon />
                                  </IconButton>
                                ),
                              }}
                            />
                          </TableCell>
                        );
                      } else {
                        if (items.every((item) => toPrint.has(item))) {
                          return (
                            <TableCell>
                              <IconButton onClick={() => setParentToPrint(new Set([...toPrint].filter((item) => !new Set(items).has(item))))}>
                                <ClearIcon />
                              </IconButton>
                            </TableCell>
                          );
                        } else {
                          return (
                            <TableCell>
                              <IconButton onClick={() => setParentToPrint(new Set([...items, ...toPrint]))}>
                                <AddIcon />
                              </IconButton>
                            </TableCell>
                          );
                        }
                      }
                    }
                  })}
              </TableRow>
            </TableHead>
            {items && (
              <TableBody>
                {items.map((item) => (
                  <TableRow sx={{ backgroundColor: item.invented === 'yes' ? '#e8f5e9' : '#ffebee' }}>
                    {fields &&
                      [...fields.keys()].map((key) => {
                        if (fields.get(key)) {
                          if (key !== 'Print') {
                            return <TableCell sx={{ border: '1px solid grey' }}>{item[key]}</TableCell>;
                          } else {
                            return <TableCell align="center">{getPrintButton(item)}</TableCell>;
                          }
                        }
                      })}
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
