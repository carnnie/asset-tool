import { useEffect, useState, Fragment, ChangeEvent } from 'react';
// import { UserContext, user } from "../App";
// import axios from "axios";
import CircularSpinner from '../../components/spinner';
import { Invent, Item, Report, reports, filters, filterItems } from './data';
// import { test_items } from '../../test_data/test';
// MUI
import Box from '@mui/material/Box';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TableViewIcon from '@mui/icons-material/TableView';
import CloseIcon from '@mui/icons-material/Close';
import ItemsTable from './table';
// import Badge from '@mui/material/Badge'
// import Chip from '@mui/material/Chip';
import axios from 'axios';
import ReportTable from './reportTable';
import Notify from './notify';

export default function ItInvent() {
  // const user = useContext<user>(UserContext);
  const [load, setLoad] = useState<Boolean>(false);
  const [invents, setInvents] = useState<Array<Invent>>([]);
  const [inventory, setInventory] = useState<Invent | undefined>(undefined);
  const [items, setItems] = useState<Array<Item>>([]);
  const [shownItems, setShown] = useState<Array<Item>>([]);
  const [showFilter, setShowFilters] = useState<Boolean>(false);
  const [showNotify, setShowNotify] = useState<Boolean>(false);
  const [fields, setFields] = useState<Map<string, boolean>>(filters);
  const [report, setReport] = useState<Report | null>(null);
  const [results, setResults] = useState<number>(items.length);
  // const [printers, setPrinters] = useState<Map<string, Printer>>();
  // const [printer, setPrinter] = useState<Printer>();
  const [toPrint, setToPrint] = useState<Set<Item>>(new Set());

  // states
  const handleSelectInvent = (event: SelectChangeEvent<string | null>) => {
    for (let i = 0; i < invents.length; i++) {
      if (invents[i].Key == event.target.value) {
        setInventory(invents[i]);
      }
    }
  };

  const handleChangeFilter = (event: ChangeEvent<HTMLInputElement>) => {
    filters.set(event.target.value, !fields.get(event.target.value));
    setFields(new Map(filters)); // here need to create new map coz useState dosnt see changes if it in mutable
  };

  const requestInventItems = async () => {
    setLoad(true);
    setItems([]);
    let [invented, not_invented] = await Promise.all([
      axios.post('/mobile/it_iql/', { itemType: 'Hardware', iql: `"Store" = ${inventory?.InventoryStore} AND object HAVING inboundReferences("Inventory" = ${inventory?.Key})` }).then((response) => {
        const new_items = response.data.result;
        new_items.forEach((item: Invent) => {
          item.invented = 'yes';
        });
        return new_items;
      }),
      axios
        .post('/mobile/it_iql/', { itemType: 'Hardware', iql: `"Store" = ${inventory?.InventoryStore} AND object NOT HAVING inboundReferences("Inventory" = ${inventory?.Key})` })
        .then((response) => {
          const new_items = response.data.result;
          new_items.forEach((item: Invent) => {
            item.invented = 'no';
          });
          return new_items;
        }),
    ]);
    setItems([...invented, ...not_invented]);
    setReport(reports[0]);
    setLoad(false);
  };

  // const handlePrint = () => {
  //   axios.post('/test', { printer: printer?.name, items: [...toPrint] });
  //   console.log(toPrint.size);
  // };

  const handleToExcel = () => {
    axios
      .post('/it-invent/api_inv/report/', { "items": shownItems, "fields": [...fields.keys()].filter(k => fields.get(k)) }, { responseType: 'blob' })
      .then((response) => response.data)
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report?.name}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      });
  };

  // effects
  useEffect(() => {
    setLoad(true);
    axios.post('/mobile/it_iql/', { itemType: 'Inventory_IT', iql: '"InventoryStatus" = "Open"' }).then((response) => {
      setInvents(response.data.result.sort((a: Invent, b: Invent) => (a.InventoryStore < b.InventoryStore ? -1 : 1)));
      setLoad(false);
    });
    document.title = 'IT invent';
  }, []);

  useEffect(() => {
    if (report !== null) {
      const tmpItems = filterItems(items, report.filter);
      setShown(tmpItems);
      setResults(tmpItems.length);
    }
  }, [report]);

  return (
    <Box pt={'5vh'} sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
      {load && <CircularSpinner />}
      <Grid container spacing={1} width={'30%'} minWidth={'450px'} pl={'5%'}>
        <Grid item xs={4}>
          <Select fullWidth size="small" id="inventory-select" value={inventory ? inventory.Key : null} onChange={(event) => handleSelectInvent(event)}>
            {invents &&
              invents.map((inv: Invent) => {
                return <MenuItem value={inv.Key}>{inv.InventoryStore}</MenuItem>;
              })}
          </Select>
        </Grid>
        <Grid item xs={4}>
          <Button fullWidth variant="contained" sx={{ height: '39px' }} disabled={inventory === undefined || load ? true : false} onClick={requestInventItems}>
            Запрос к БД
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button fullWidth variant="contained" sx={{ height: '39px' }} onClick={() => setShowFilters(!showFilter)}>
            Фильтры
          </Button>
        </Grid>
        <Grid item xs={4}>
          <PopupState variant="popover" popupId="report-popup-menu">
            {(popupState) => (
              <Fragment>
                <Button fullWidth variant="contained" sx={{ height: '39px' }} {...bindTrigger(popupState)} disabled={load || !items.length ? true : false}>
                  Отчеты
                  <ExpandMoreIcon />
                </Button>
                <Menu {...bindMenu(popupState)}>
                  {reports &&
                    reports
                      .sort((a, b) => (a.name < b.name ? -1 : 0))
                      .map((report) => [
                        <MenuItem
                          onClick={() => {
                            setReport(report);
                            popupState.close;
                          }}
                          value={report.name}
                        >
                          {report.name}
                        </MenuItem>,
                      ])}
                </Menu>
              </Fragment>
            )}
          </PopupState>
        </Grid>
        <Grid item xs={4}>
          <Button onClick={() => setShowNotify(!showNotify)} variant="contained" fullWidth sx={{ height: '39px' }} disabled={inventory && items.length ? false : true}>
            Рассылка
          </Button>
        </Grid>
        {/* <Grid item xs={3}>
          <PopupState variant="popover" popupId="print-popup-menu">
            {(popupState) => (
              <Fragment>
                <Button fullWidth variant="contained" sx={{ height: '39px' }} {...bindTrigger(popupState)}>
                  Печать
                  <ExpandMoreIcon />
                  <Chip color="error" label={toPrint.size} size="small" />
                </Button>
                <Menu {...bindMenu(popupState)}>
                  <MenuItem>
                    Столбец
                    <Checkbox onChange={(event) => handleChangeFilter(event)} value={'Print'} checked={fields.get('Print')} />
                  </MenuItem>
                  <MenuItem>Список</MenuItem>
                </Menu>
              </Fragment>
            )}
          </PopupState>
        </Grid> */}
        <Grid item xs={4}>
          <Button fullWidth variant="contained" sx={{ height: '39px' }} onClick={handleToExcel} color="success" disabled={load || !items.length ? true : false}>
            <TableViewIcon />В Excel
          </Button>
        </Grid>
      </Grid>
      {showFilter && (
        <Box
          boxShadow={3}
          sx={{
            position: 'absolute',
            width: '600px',
            marginLeft: '50%',
            left: '-300px',
            marginTop: '30vh',
            background: 'white',
          }}
        >
          <IconButton aria-label="close" sx={{ position: 'absolute', left: '560px' }} onClick={() => setShowFilters(false)}>
            <CloseIcon fontSize="inherit" />
          </IconButton>
          <Grid container p={'10px 20px'}>
            {[...filters.keys()].map((field) => {
              return (
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={(event) => {
                          handleChangeFilter(event);
                        }}
                        value={field}
                        checked={fields.get(field)}
                      />
                    }
                    label={field}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
      {inventory && showNotify && <Notify invent={inventory.InventoryStore} setShowNotify={setShowNotify} items={items} />}
      <Box justifyContent={'center'} flexGrow={1}>
        {report && (
          <Typography display="block" width={'100%'} variant="h5" color="initial" textAlign={'center'}>
            {report.label}
          </Typography>
        )}
        {shownItems && (
          <Typography display="block" width={'100%'} variant="overline" color="initial" textAlign={'center'}>
            результатов оборажено {results}
          </Typography>
        )}
      </Box>
      {!['Кассы', 'По местам'].includes(report ? report.name : '') ? (
        <ItemsTable parent_items={shownItems} fields={fields} setParentResults={setResults} toPrint={toPrint} setParentToPrint={setToPrint} />
      ) : (
        <ReportTable report={report} items={shownItems} fields={fields} />
      )}
    </Box>
  );
}
