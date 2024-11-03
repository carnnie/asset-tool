import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { Device } from '../../pages/it-utilization/it-utilization';
import { useEffect, useState } from 'react';
import GppGoodIcon from '@mui/icons-material/GppGood';
import { HelpMenu } from './helpMenu';
import { Box } from '@mui/material';

export interface errors {
  inv_in_several_rows: boolean;
  different_invs_in_same_row: boolean;
}

const columns: Array<GridColDef> = [
  {
    field: 'errors',
    headerName: 'Ошибки',
    type: 'boolean',
    valueGetter: (value: errors) => {
      return !(value.inv_in_several_rows || value.different_invs_in_same_row);
    },
    cellClassName: () => 'errors-cell',
    renderCell: (params) =>
      params.row.errors.inv_in_several_rows || params.row.different_invs_in_same_row ? (
        <HelpMenu errors={params.row.errors} rows={params.row.rows} />
      ) : (
        <GppGoodIcon />
      ),
    width: 70,
  },
  { field: 'ТЦ', headerName: 'ТЦ', width: 70 },
  { field: 'Серийный номер', headerName: 'Серийный номер', width: 140 },
  { field: 'Тип (англ)', headerName: 'Тип (англ)', width: 240 },
  { field: 'Модель', headerName: 'Модель', width: 200 },
  { field: 'Тип (рус)', headerName: 'Тип (рус)', width: 100 },
  { field: 'Инвентарный номер', headerName: 'Инвентарный номер', width: 170 },
  { field: 'Номер SAP', headerName: 'Номер САП', editable: true, width: 120 },
  { field: 'Название ОС', headerName: 'Название ОС', editable: true, width: 170 },
  { field: 'Дата списания ОС', headerName: 'Дата списания ОС', editable: true, width: 140 },
];

interface Props {
  rows: Array<Device>;
  setRowsToSend: React.Dispatch<React.SetStateAction<Array<Device | undefined>>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UtilizationTable({ rows, setRowsToSend, setLoading }: Props) {
  const [updatedRows, setUpdatedRows] = useState(rows);

  const filterRows = (ids: GridRowSelectionModel) => {
    const selectedIDs = new Set(ids);
    const selectedRowData = updatedRows.filter((row) => selectedIDs.has(row.id));
    setRowsToSend(selectedRowData);
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <Box sx={{ height: 'calc(100vh - 48px - 88px)', overflow: 'auto' }}>
      <DataGrid
        sx={{
          '.warning': {
            bgcolor: '#ff3333 !important',
          },

          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'transparent',
          },

          '&.MuiDataGrid-root .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },

          '&.MuiDataGrid-root .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none',
          },
        }}
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 100 },
          },
        }}
        pageSizeOptions={[100]}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={filterRows}
        processRowUpdate={(updatedRow) => {
          const rowsCopy = [...updatedRows];
          rowsCopy[updatedRow.id - 1] = updatedRow;
          setUpdatedRows(rowsCopy);
          return updatedRow;
        }}
        getRowClassName={(params) => {
          if (params.row.errors.inv_in_several_rows || params.row.errors.different_invs_in_same_row) {
            return 'warning';
          } else {
            return '';
          }
        }}
      />
    </Box>
  );
}
