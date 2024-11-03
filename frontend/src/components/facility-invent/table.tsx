import { Box, Button } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { Hardware } from '../../utilities/interfaces';
import { useContext, useState } from 'react';
import { ListsContext } from '../../pages/group-edit/groupEdit';
import { CreateModal } from './createModal';
import { LoaderContext } from '../../App';
import { FieldData } from '../../pages/facility-invent/facilityInvent';

interface Props {
  items: Array<Hardware>;
  setCheckedItems: React.Dispatch<React.SetStateAction<Array<Hardware>>>;
  fields: Array<FieldData>;
}

export function FacilitiesTable({ items, setCheckedItems, fields }: Props) {
  const lists = useContext(ListsContext);

  const columns: Array<GridColDef> = fields.map((field) => ({field: field.name, flex: 1 }))

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector slotProps={{ tooltip: { title: 'Change density' } }} />
        <Box sx={{ flexGrow: 1 }} />
      </GridToolbarContainer>
    );
  }

  const filterItems = (ids: GridRowSelectionModel) => {
    const selectedIDs = new Set(ids);
    const selectedRowData = items.filter((item) => selectedIDs.has(item.id));
    setCheckedItems(selectedRowData);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 48px - 40px - 32px)', overflow: 'auto' }}>
      <DataGrid
        sx={{
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
        rows={items}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
          columns: {
            columnVisibilityModel: {
              Department: false,
              // Unit_Eq: false,
              'BRANCH NEW': false,
              'Serial No': false,
              State: false,
              Pallet: false,
              User: false,
              'MAC address': false,
              'Part No': false,
              'Seal No': false,
            },
          },
        }}
        pageSizeOptions={[25, 50, 100]}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={filterItems}
        slots={{ toolbar: CustomToolbar }}
        disableColumnMenu
        resizeThrottleMs={1}
        localeText={{
          noRowsLabel: 'Нет данных',
          toolbarFilters: 'Фильтры',
          toolbarDensity: 'Плотность',
          toolbarColumns: 'Колонки',
          columnsManagementSearchTitle: 'Поиск',
          columnsManagementShowHideAllText: 'Показать/скрыть все',
          columnsManagementReset: 'Сброс',
          filterPanelOperator: 'Оператор',
          filterPanelColumns: 'Колонки',
          filterPanelInputLabel: 'Значение',
          filterPanelInputPlaceholder: 'Фильтруемое значение',
          filterOperatorContains: 'содержит',
          filterOperatorEquals: 'равно',
          filterOperatorStartsWith: 'начинается с',
          filterOperatorEndsWith: 'заканчивается на',
          filterOperatorIsEmpty: 'пусто',
          filterOperatorIsNotEmpty: 'не пусто',
          filterOperatorIsAnyOf: 'равно одному из',
          footerRowSelected: (number) => `Строк выбрано: ${number}`,
        }}
        slotProps={{
          pagination: {
            labelRowsPerPage: 'Строк на одной странице',
            labelDisplayedRows: ({ from, to, count }) => `${from} - ${to} из ${count}`,
          },
        }}
        // processRowUpdate={(updatedRow, originalRow) => {
        //   const objKey = originalRow.Key;
        //   const attrs = Object.fromEntries(
        //     Object.entries(updatedRow)
        //       .filter(([key]) => updatedRow[key] !== originalRow[key])
        //       .map(([attrName, attrValue]) => [
        //         attrName,
        //         lists[attrName].filter((obj) => obj.label === attrValue)[0].key,
        //       ])
        //   );

        //   setEditData((lastState) => ({
        //     ...lastState,
        //     [objKey]: { ...(lastState[objKey] || {}), ...attrs },
        //   }));
        //   return updatedRow;
        // }}
      />
    </Box>
  );
}
