import { Box } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { editData, Hardware } from '../../utilities/interfaces';
import { useContext } from 'react';
import { ListsContext } from '../../pages/group-edit/groupEdit';

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

interface Props {
  items: Array<Hardware>;
  setCheckedItems: React.Dispatch<React.SetStateAction<Array<Hardware>>>;
  setEditData: React.Dispatch<React.SetStateAction<editData>>;
}

export function GroupEditTable({ items, setCheckedItems, setEditData }: Props) {
  const lists = useContext(ListsContext);

  // valueOptions не видит почему-то при обращении извне, поэтому определяем здесь
  const columns: Array<GridColDef> = [
    { field: 'Name', flex: 1 },
    { field: 'Store', flex: 0.4 },
    { field: 'INV No', flex: 0.4 },
    { field: 'Type', flex: 1 },
    { field: 'Model', flex: 1 },
    { field: 'Location', flex: 1 },
    { field: 'Description', flex: 1 },
    { field: 'Department', flex: 1 },
    {
      field: 'Unit_Eq',
      flex: 1,
      editable: true,
      type: 'singleSelect',
      valueOptions: lists.Unit_Eq.map((obj) => obj.label),
    },
    { field: 'BRANCH NEW', flex: 1 },
    { field: 'Serial No', flex: 1 },
    { field: 'State', flex: 1 },
    { field: 'Pallet', flex: 1 },
    { field: 'User', flex: 1 },
    { field: 'MAC address', flex: 1 },
    { field: 'Part No', flex: 1 },
    { field: 'Seal No', flex: 1 },
  ];

  const filterItems = (ids: GridRowSelectionModel) => {
    const selectedIDs = new Set(ids);
    const selectedRowData = items.filter((item) => selectedIDs.has(item.id));
    setCheckedItems(selectedRowData);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 48px)', overflow: 'auto', flexGrow: 1 }}>
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
        processRowUpdate={(updatedRow, originalRow) => {
          const objKey = originalRow.Key;
          const attrs = Object.fromEntries(
            Object.entries(updatedRow)
              .filter(([key]) => updatedRow[key] !== originalRow[key])
              .map(([attrName, attrValue]) => [
                attrName,
                lists[attrName].filter((obj) => obj.label === attrValue)[0].key,
              ])
          );

          setEditData((lastState) => ({
            ...lastState,
            [objKey]: { ...(lastState[objKey] || {}), ...attrs },
          }));
          return updatedRow;
        }}
      />
    </Box>
  );
}
