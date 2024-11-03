import { Autocomplete, TextField } from '@mui/material';
import axios from 'axios';
import { useEffect } from 'react';
import { Pallet, PalletOption, StoreOption, WaveOption } from '../../pages/it-utilization/it-utilization';

interface Store {
  Key: string;
  Name: string;
  [key: string]: any;
}

interface Props {
  storeList: Array<StoreOption>;
  setStoreList: React.Dispatch<React.SetStateAction<Array<StoreOption>>>;
  setPalletList: React.Dispatch<React.SetStateAction<Array<PalletOption>>>;
  setWavesList: React.Dispatch<React.SetStateAction<Array<WaveOption>>>;
  setStore: React.Dispatch<React.SetStateAction<string>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SelectStore({
  storeList,
  setStoreList,
  setPalletList,
  setWavesList,
  setStore,
  setLoading,
}: Props) {
  const changeStore = (_event: React.SyntheticEvent<Element | Event>, value: StoreOption | null) => {
    if (storeList.some((store) => store.label === value?.label)) {
      setLoading(true);

      setStore(value ? value.label : '');

      const iql = value ? `"Store" = "${value.label}"` : '';

      axios.post('/iql/', { itemType: 'Pallets', iql: iql }).then((response) => {
        const palletList: Array<PalletOption> = response.data.result.map((obj: Pallet, index: number) => ({
          id: index,
          label: obj.Name,
        }));
        const wavesList = [];

        for (const pallet of palletList) {
          const palletWave = pallet.label.match(/[Ww]ave_\d+/)?.[0]; // Wave_6 or null
          const waveObjCopy = wavesList.filter((wave) => palletWave === wave.label)?.[0];

          if (waveObjCopy) {
            waveObjCopy.pallets.push(pallet);
          } else if (palletWave) {
            wavesList.push({ id: wavesList.length, label: palletWave, pallets: [pallet] });
          }
        }

        setPalletList(palletList);
        setWavesList(wavesList);
        setLoading(false);
      });
    } else {
      setWavesList([]);
    }
  };

  useEffect(() => {
    axios
      .post('/iql/', { itemType: 'Store', iql: 'Name IS NOT empty' })
      .then((response) => {
        let storeList = response.data.result;
        storeList = storeList.map((obj: Store, index: number) => ({ id: index, label: obj.Name }));
        setStoreList(storeList);
        setLoading(false);
      });
  }, []);

  return (
    <Autocomplete
      options={storeList}
      autoHighlight
      sx={{ width: 1 }}
      renderInput={(params) => (
        <TextField {...params} label="Store" onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} />
      )}
      onChange={changeStore}
    />
  );
}
