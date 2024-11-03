import { user, UserContext } from '../../App';
import { useContext, useEffect, useRef, useState } from 'react';
import { Item, Store, Location } from './data';
import Card from './card';
import axios from 'axios';
import NotificationWithButton from '../../components/notifications/alertWithButton';
import NotificationSuccess from '../../components/notifications/allGood';

// MUI
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import CircularSpinner from '../../components/spinner';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { IconButton, TableCell } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const l: number = 3.5;
const border: string = 'solid #D3D3D3 1px';
const searchLabels: Map<string, string> = new Map([
  ['takeback', 'Введите номер оборудования или фамилию пользователя(на английском)'],
  ['giveaway', 'Введите номер реквеста вида ITREQ-000000'],
  ['giveawayIT', 'Введите номер оборудования'],
  ['send', ''],
]);

const resultProps: Array<string> = ['INV No', 'Serial No', 'User', 'Инв No и модель', 'For user'];
// import Box from '@mui/material/Box';

export default function Mobile() {
  const user: user = useContext(UserContext);
  const [action, setAction] = useState<string>(''); // make it reducer
  const [querry, setQuerry] = useState<string>('');
  const [stores, setStores] = useState<Array<Store>>([]);
  const [locations, setLocations] = useState<Array<Location>>([]);
  const [item, setItem] = useState<Item | null>(null);
  const [items, setItems] = useState<Array<Item>>([]);
  const [loading, setLoading] = useState<Boolean>(false);
  const [sucMsg, setSucMsg] = useState<string>('');
  const [alert, setAlert] = useState(false);
  const abortControllerRef = useRef<AbortController>();
  const [trHeight, setTrh] = useState('73px'); // dynamyc bottom row of card

  const handleResize = () => {
    const h = document.querySelector('#top-row');
    const trHeight = h ? getComputedStyle(h).getPropertyValue('height') : '73px';
    setTrh(trHeight);
  };
  const handleResetItems = (msg: string) => {
    const newitems: Array<Item> = items.filter((i) => i !== item);
    setItems(newitems);
    setItem(null);
    setSucMsg(msg);
  };

  useEffect(() => {
    if (user.roles.includes('MCC_RU_INSIGHT_IT_ROLE')) {
      axios.post('/mobile/it_iql/', { itemType: 'Store', iql: 'Name IS NOT empty' }).then((response) => setStores(response.data.result));
      axios.post('/mobile/it_iql/', { itemType: 'Location', iql: 'Name IS NOT empty and "Store" IS NOT empty' }).then((response) => setLocations(response.data.result));
    }

    window.addEventListener('resize', handleResize);
    document.title = 'Mobile invent';
  }, []);

  useEffect(() => {
    setItem(null);
    setItems([]);
    setQuerry('');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  }, [action]);

  useEffect(() => {
    setItem(null);
    if (abortControllerRef && abortControllerRef.current) {
      abortControllerRef.current?.abort('');
    }
    setLoading(true);
    if ((querry.length > 3 && action !== 'giveaway') || (action === 'giveaway' && querry.toLowerCase().startsWith('itreq') && querry.length > 11)) {
      const controller = (abortControllerRef.current = new AbortController());
      const signal = controller.signal;
      axios.post(`/mobile/${action}/`, { querry: querry }, { signal: signal }).then((response) => {
        setItems(response.data.result);
        if (!response.data.result.length) {
          setAlert(true);
        } else {
          setAlert(false);
        }
        setLoading(false);
      });
    } else if (action === 'send') {
      const controller = (abortControllerRef.current = new AbortController());
      const signal = controller.signal;
      axios
        .post('/mobile/send/', { signal: signal })
        .then((respponse) => setItems(respponse.data.result))
        .finally(() => setLoading(false));
      axios.post('/mobile/it_iql/', { itemType: 'Store', iql: 'Name IS NOT empty' }).then((response) => setStores(response.data.result));
    } else {
      setItem(null);
      setItems([]);
      setLoading(false);
    }

    // setItems(test_items);
  }, [querry, action]);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, margin: 0, height: '96vh', width: '100%' }}>
        <Box sx={{ boxShadow: 8, height: '86vh', width: '84%' }}>
          <Grid container xs={12} borderBottom={border} id="top-row">
            <Grid item xs={l} p={1} sx={{ borderRight: border }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Выберите действие</InputLabel>
                <Select label="Выберите действие" value={action} id="action-select" onChange={(event) => setAction(event.target.value)} sx={{ width: '100%' }}>
                  <MenuItem value={'giveaway'}>Выдать по реквесту</MenuItem>
                  {user.roles.includes('MCC_RU_INSIGHT_IT_ROLE') && <MenuItem value={'giveawayIT'}>Выдать Оборудование</MenuItem>}
                  <MenuItem value={'takeback'}>Сдать</MenuItem>
                  <MenuItem value={'send'}>Переслать</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12 - l} p={1}>
              <TextField
                id="search-field"
                fullWidth
                label={action ? searchLabels.get(action) : ''}
                value={querry}
                onChange={(event) => setQuerry(event.target.value)}
                disabled={action == 'send' || !action}
              />
            </Grid>
          </Grid>
          <Grid container sx={{ height: `calc(86vh - ${trHeight})` }}>
            <Grid
              item
              xs={l}
              sx={{ height: '100%', borderRight: border, overflowY: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, '&-ms-overflow-style': { display: 'none' } }}
            >
              <Table size="small">
                {[...items].map((cItem: Item) => {
                  return (
                    <TableRow onClick={() => setItem(cItem)} sx={{ background: item === cItem ? '#CCCCCC' : '', '&:hover': { background: '#7CB9FF' } }}>
                      <TableCell>
                        <Grid container>
                          <Grid item xs={12}>
                            <b>{cItem.Name}</b>
                          </Grid>
                          {resultProps.map((prop) => {
                            if (prop in cItem) {
                              return (
                                <Grid container>
                                  <Grid xs={4}>{prop}:</Grid>
                                  <Grid xs={8}>{cItem[prop]}</Grid>
                                </Grid>
                              );
                            }
                          })}
                        </Grid>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Table>
            </Grid>
            <Grid item xs={12 - l} position={'relative'}>
              {item && (
                <IconButton onClick={() => setItem(null)} sx={{ position: 'absolute', left: '95%' }}>
                  <CloseIcon />
                </IconButton>
              )}
              {item && <Card item={item} action={action} stores={stores} locations={locations} handleParentItem={handleResetItems} />}
            </Grid>
          </Grid>
        </Box>
        {loading && <CircularSpinner />}
        {sucMsg.length !== 0 && <NotificationSuccess text={sucMsg} setAlert={setSucMsg} />}
        {alert && (
          <NotificationWithButton
            text="По запросу ничего не найдено"
            setAlert={setAlert}
            data={
              new Map([
                ['action', action],
                ['querry', querry],
                ['user', JSON.stringify(user)],
              ])
            }
          />
        )}
      </Box>
    </>
  );
}
