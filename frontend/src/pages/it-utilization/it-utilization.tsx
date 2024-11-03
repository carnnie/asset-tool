import { Box, Button, Grid } from '@mui/material';
import { SelectStore } from '../../components/it-utilization/selectStore';
import { SelectWave } from '../../components/it-utilization/selectWave';
import { useState } from 'react';
import axios from 'axios';
import { UtilizationTable } from '../../components/it-utilization/utilizationTable';
import { FileInput } from '../../components/it-utilization/fileInput';
import { CompleteModal } from '../../components/it-utilization/completeModal';
import { SelectPallets } from '../../components/it-utilization/selectPallets';
import { Loader } from '../../components/loader';
// import { GeneralBreadcrumbs } from '../../components/breadcrumbs';

export interface Device {
  id: number;
  inv_no: string;
  name: string;
  sap_no: string;
  amount: number;
}

export interface StoreOption {
  id: number;
  label: string;
}

export interface PalletOption {
  id: number;
  label: string;
}

export interface WaveOption {
  id: number;
  label: string;
  pallets: Array<PalletOption>;
}

export interface Pallet {
  Key: string;
  Name: string;
  [key: string]: any;
}

export default function ItUtilization() {
  const [loading, setLoading] = useState<boolean>(true);

  const [storeList, setStoreList] = useState<Array<StoreOption>>([]);
  const [palletList, setPalletList] = useState<Array<PalletOption>>([]);
  const [wavesList, setWavesList] = useState<Array<WaveOption>>([]);

  const [selectedStore, setStore] = useState<string>('');
  const [selectedPallets, setPallets] = useState<Array<PalletOption>>([]);
  const [selectedWave, setWave] = useState<WaveOption | null>(null);
  const [selectedFile, setFile] = useState<File | string>('');

  const [rows, setRows] = useState<Array<Device>>([]);
  const [rowsToSend, setRowsToSend] = useState<Array<Device | undefined>>([]);

  const [openModal, setOpenModal] = useState<boolean>(false);

  const showTable = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const pallets = selectedPallets.map((obj) => obj.label); // [] или [...], но тогда selectedWaves = []
    if (selectedWave) {
      pallets.push(...selectedWave.pallets.map((obj) => obj.label));
    }

    const form = new FormData();
    form.append('store', selectedStore);
    form.append('pallets', JSON.stringify(pallets));
    form.append('file', selectedFile);

    axios
      .post('/it-utilization/handle-report/', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        setRows(response.data.result);
      });
  };

  const sendResult = (_event: React.MouseEvent<HTMLElement>) => {
    setLoading(true);
    axios
      .post('/it-utilization/send/', {
        rows: rowsToSend,
        store: selectedStore,
        pallets: selectedPallets,
        wave: selectedWave?.label,
      })
      .then((response) => {
        console.log(response);
        setLoading(false);
        setOpenModal(true);
      });
  };

  return (
    <Box>
      <form onSubmit={showTable}>
        <Grid container spacing={2} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Grid item xs={1.5}>
            <SelectStore
              storeList={storeList}
              setStoreList={setStoreList}
              setPalletList={setPalletList}
              setWavesList={setWavesList}
              setStore={setStore}
              setLoading={setLoading}
            />
          </Grid>
          <Grid item xs={3}>
            <SelectPallets palletList={palletList} setPallets={setPallets} disabled={!!selectedWave} />
          </Grid>
          <Grid item xs={2}>
            <SelectWave wavesList={wavesList} setWave={setWave} disabled={!!selectedPallets.length} />
          </Grid>
          <Grid item xs="auto">
            <FileInput setFile={setFile} />
          </Grid>
          <Grid item xs="auto">
            <Button
              type="submit"
              variant="contained"
              color="success"
              disabled={!selectedPallets.length && !selectedWave}
            >
              Вывести на экран
            </Button>
          </Grid>
          <Grid item xs="auto">
            <Button variant="contained" color="success" onClick={sendResult} disabled={!rowsToSend.length}>
              Отправить в бухгалтерию
            </Button>
            <CompleteModal openModal={openModal} setOpenModal={setOpenModal} text="Таблица отправлена!" />
          </Grid>
        </Grid>
      </form>
      {rows.length ? (
        <UtilizationTable rows={rows} setRowsToSend={setRowsToSend} setLoading={setLoading} />
      ) : (
        <></>
      )}
      <Loader loading={loading} />
    </Box>
  );
}
