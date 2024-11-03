import { Box } from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { InventTable } from '../../components/it-invent-mng/inventTable';
import { InventMenu } from '../../components/it-invent-mng/inventMenu';
import { GridCellParams } from '@mui/x-data-grid';
import { Store } from '../../utilities/interfaces';
import { OpenInventModal } from '../../components/it-invent-mng/openInventModal';
import { StatusMenu } from '../../components/it-invent-mng/statusMenu';
import { YearMenu } from '../../components/it-invent-mng/yearMenu';
import { Loader } from '../../components/loader';
import { LoaderContext } from '../../App';

export interface Inventory {
  Created: string;
  InventoryID: string;
  InventoryOpen: string;
  InventoryStatus: string;
  InventoryStore: string;
  InventoryUserCreate: string;
  InventoryYear?: string;
  Key: string;
  Updated: string;
  id: number;
  link: string;
}

export interface Options {
  id: number;
  label: string;
  key: string;
}

export function ItInventMng() {
  const setLoading = useContext(LoaderContext);
  const [inventories, setInventories] = useState<Array<Inventory>>([]);
  const [stores, setStores] = useState<Array<Options>>([]);
  const [selectedStore, setSelectedStore] = useState<Options | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('Open');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [fullReload, setFullReload] = useState<boolean>(false);

  const filteredInvs = inventories
    .filter((obj) => obj.InventoryStatus.includes(statusFilter))
    .filter((obj) => obj.InventoryYear?.includes(yearFilter));
  const years = Array.from(new Set(inventories.map((obj) => obj.InventoryYear)));

  const columns = [
    {
      field: 'InventoryYear',
      sortable: false,
      width: 120,
      renderHeader: () => <YearMenu years={years} yearFilter={yearFilter} setYearFilter={setYearFilter} />,
    },
    { field: 'InventoryStore', headerName: 'ТЦ', width: 100 },
    {
      field: 'InventoryStatus',
      sortable: false,
      headerName: 'Статус',
      width: 140,
      renderHeader: () => <StatusMenu statusFilter={statusFilter} setStatusFilter={setStatusFilter} />,
    },
    { field: 'Created', headerName: 'Дата открытия', width: 200 },
    { field: 'InventoryUserCreate', headerName: 'Кто открыл', width: 200 },
    { field: 'InventoryClose', headerName: 'Дата закрытия', width: 200 },
    { field: 'InventoryUserClose', headerName: 'Кто закрыл', width: 170 },
    {
      field: 'Действие',
      headerName: 'Действие',
      sortable: false,
      renderCell: (params: GridCellParams) => {
        return (
          <InventMenu params={params} handleCancelInv={handleCancelInv} handleCloseInv={handleCloseInv} />
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    axios
      .post('http://127.0.0.1:8000/iql/', {
        itemType: 'Inventory_IT',
        iql: '',
        order_field: 'InventoryStore',
      })
      .then((response) => {
        const rows: Array<Inventory> = response.data.result;
        setInventories(
          rows.map((row) => ({
            ...row,
            InventoryYear: '20' + row.InventoryOpen.slice(-2),
          }))
        );
        setLoading(false);
      });
  }, [fullReload]);

  useEffect(() => {
    axios
      .post('http://127.0.0.1:8000/iql/', {
        itemType: 'Store',
        iql: '"Need_Inventory" = True',
      })
      .then((response) => {
        const stores: Array<Store> = response.data.result;
        const openInvStores = filteredInvs.map((obj) => obj.InventoryStore);
        const availableStores = stores.filter((obj) => !openInvStores.includes(obj.Name));
        setStores(
          availableStores.map((obj, index) => ({
            id: index,
            label: obj.Name,
            key: obj.Key,
          }))
        );
      });
  }, [inventories]);

  const handleOpenInv = () => {
    setLoading(true);

    axios
      .post('http://127.0.0.1:8000/it-invent-mng/open/', {
        store_num: selectedStore?.label,
        store_key: selectedStore?.key,
      })
      .then(() => {
        setFullReload((lastState) => !lastState);
      });
  };

  const handleCancelInv = (invId: string) => {
    setLoading(true);

    axios.post('http://127.0.0.1:8000/it-invent-mng/cancel/', { inv_id: invId }).then(() => {
      setFullReload((lastState) => !lastState);
    });
  };

  const handleCloseInv = (invId: string, invName: string, storeNum: string) => {
    setLoading(true);

    axios
      .post('http://127.0.0.1:8000/it-invent-mng/close/', {
        inv_id: invId,
        inv_name: invName,
        store_num: storeNum,
      })
      .then(() => {
        setFullReload((lastState) => !lastState);
      });
  };

  return (
    <Box sx={{ mt: 4, mx: '8%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <OpenInventModal
          stores={stores}
          selectedStore={selectedStore}
          setSelectedStore={setSelectedStore}
          handleOpenInv={handleOpenInv}
        />
      </Box>
      <InventTable rows={filteredInvs} columns={columns} />
    </Box>
  );
}
