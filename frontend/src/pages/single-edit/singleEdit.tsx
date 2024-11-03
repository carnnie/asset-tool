import { Box, TextField } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { SearchResults } from '../../components/single-edit/searchResults';
import axios from 'axios';
import { Hardware } from '../../utilities/interfaces';
import { ItemCard } from '../../components/single-edit/itemCard';
import { Loader } from '../../components/loader';
import { CompleteModal } from '../../components/it-utilization/completeModal';
import { LoaderContext } from '../../App';

interface Printer {
  name: string;
  ip: string;
}

export interface PrinterOption {
  id: number;
  label: string;
  ip: string;
}

export function SingleEdit() {
  const setLoading = useContext(LoaderContext);
  const [openCompleteModal, setOpenCompleteModal] = useState(false);

  const [inputValue, setInputValue] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<Hardware>>([]);
  const [selectedItem, setSelectedItem] = useState<Hardware>();
  const [itemToReload, setItemToReload] = useState<boolean | string>(false);
  const [printerList, setPrinterList] = useState([]);

  const iql = `"INV No" LIKE ${inputValue} OR "Serial No" LIKE ${inputValue}`;

  useEffect(() => {
    if (inputValue) {
      const timeOutId = setTimeout(() => {
        setLoading(true);
        axios
          .post('http://127.0.0.1:8000/iql/', { itemType: 'Hardware', iql: iql, order_field: 'INV No' })
          .then((response) => {
            setSelectedItem(undefined); // ниже return, поэтому сократить никак
            setSearchResults(response.data.result);
            setLoading(false);
          });
      }, 2000);

      return () => clearTimeout(timeOutId);
    } else {
      setSearchResults([]);
      setSelectedItem(undefined);
    }
  }, [inputValue]);

  useEffect(() => {
    if (itemToReload) {
      setLoading(true);
      axios
        .post('http://127.0.0.1:8000/iql/', { itemType: 'Hardware', iql: iql, order_field: 'INV No' })
        .then((response) => {
          setSearchResults(response.data.result);
          axios
            .post('http://127.0.0.1:8000/iql/', { itemType: 'Hardware', iql: `"INV No" = ${itemToReload}` })
            .then((response) => {
              setSelectedItem(response.data.result[0]);
              setItemToReload(false);
              setLoading(false);
              setOpenCompleteModal(true);
            });
        });
    }
  }, [itemToReload]);

  useEffect(() => {
    setLoading(true);
    axios.get('http://127.0.0.1:8000/single-edit/printers/').then((response) => {
      const printers = response.data.result.map((obj: Printer, index: number) => ({
        id: index,
        label: obj.name,
        ip: obj.ip,
      }));
      setPrinterList(printers);
      setLoading(false);
    });
  }, []);

  return (
    <Box
      sx={{
        height: 'calc(100vh - 48px - 20px - 30px)',
        p: '5px',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        mt: '20px',
        mx: 10,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 1, borderBottom: '1px solid #DFDFDF' }}>
        <TextField
          autoFocus
          autoComplete="off"
          sx={{ width: 1 }}
          label="Введите инвентарный или серийный номер оборудования"
          onChange={(event) => setInputValue(event.target.value)}
        />
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', maxHeight: 'calc(100% - 56px - 0.8px - 8px - 5px - 2px)' }}>
        <Box
          sx={{
            width: '20%',
            borderRight: '1px solid #DFDFDF',
            paddingRight: '6px',
            overflowY: 'scroll',
            scrollbarWidth: 'none',
          }}
        >
          {searchResults && <SearchResults results={searchResults} setSelectedItem={setSelectedItem} />}
        </Box>
        {selectedItem && (
          <ItemCard
            item={selectedItem}
            setItemToReload={setItemToReload}
            printerList={printerList}
          />
        )}
      </Box>
      <CompleteModal
        openModal={openCompleteModal}
        setOpenModal={setOpenCompleteModal}
        text="Оборудование отредактировано!"
      />
    </Box>
  );
}
