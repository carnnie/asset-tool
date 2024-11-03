import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Inventory } from '../../pages/it-invent-mng/itInventMng';
import { Box } from '@mui/material';

interface Props {
  rows: Array<Inventory>;
  columns: Array<GridColDef>;
}

export function InventTable({ rows, columns }: Props) {
  return (
    <Box sx={{ height: 'calc(100vh - 48px - 32px - 36.5px - 16px)' }}>
      <DataGrid
        sx={{
          '& .MuiDataGrid-cell:focus-within': { outline: 'none' },
          '& .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
        }}
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 100 },
          },
        }}
        pageSizeOptions={[25, 50, 100]}
        disableColumnMenu
        disableRowSelectionOnClick
      />
    </Box>
  );
}
