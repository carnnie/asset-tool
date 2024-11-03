import {
  CSSObject,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  Theme,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import { useContext, useState } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EditIcon from '@mui/icons-material/Edit';

import { SearchModal } from './searchModal';
import { editData, Hardware } from '../../utilities/interfaces';
import { EditModal } from './editModal';
import axios from 'axios';
import { LoaderContext } from '../../App';

interface Props {
  items: Array<Hardware>;
  setItems: React.Dispatch<React.SetStateAction<Array<Hardware>>>;
  checkedItems: Array<Hardware>;
  setOpenCompleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  editData: editData;
  setEditData: React.Dispatch<React.SetStateAction<editData>>;
}

const drawerWidth = 200;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
      },
    },
  ],
}));

export function MenuDrawer({
  items,
  setItems,
  checkedItems,
  setOpenCompleteModal,
  editData,
  setEditData,
}: Props) {
  const setLoading = useContext(LoaderContext);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const handleCellsEdit = () => {
    setLoading(true);
    Promise.all(
      Object.entries(editData).map(([objKey, attrs]) => {
        for (const [key, value] of Object.entries(attrs)) {
          attrs[key] = value;
        }
        return axios.post('http://127.0.0.1:8000/single-edit/edit/', {
          obj_key: objKey,
          ...attrs,
        });
      })
    ).then(() => {
      axios
        .post('http://127.0.0.1:8000/iql/', {
          itemType: 'Hardware',
          iql: `"Key" IN (${items.map((item) => item.Key).join(', ')})`,
        })
        .then((response) => {
          setEditData({});
          setItems(response.data.result);
          setLoading(false);
          setOpenCompleteModal(true);
        });
    });
  };

  return (
    <Drawer variant="permanent" open={openDrawer} onClose={() => setOpenDrawer(false)}>
      <List sx={{ mt: '48px' }}>
        <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={() => setOpenDrawer(!openDrawer)}
            sx={{
              borderRadius: 0,
              minHeight: 48,
              px: 2.5,
              justifyContent: openDrawer ? 'initial' : 'center',
            }}
          >
            {openDrawer ? <ArrowBackIcon /> : <ArrowForwardIcon />}
          </IconButton>
        </ListItem>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => setOpenSearchModal(true)}
            sx={{ minHeight: 48, px: 2.5, justifyContent: openDrawer ? 'initial' : 'center' }}
          >
            <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', mr: openDrawer ? 3 : 'auto' }}>
              <ManageSearchIcon />
            </ListItemIcon>
            <ListItemText primary="Поиск" sx={{ opacity: openDrawer ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => setOpenEditModal(true)}
            sx={{ minHeight: 48, px: 2.5, justifyContent: openDrawer ? 'initial' : 'center' }}
            disabled={!Object.entries(checkedItems).length}
          >
            <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', mr: openDrawer ? 3 : 'auto' }}>
              <EditNoteIcon />
            </ListItemIcon>
            <ListItemText primary="Редактировать" sx={{ opacity: openDrawer ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={handleCellsEdit}
            sx={{ minHeight: 48, px: 2.5, justifyContent: openDrawer ? 'initial' : 'center' }}
            disabled={!Object.entries(editData).length}
          >
            <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', mr: openDrawer ? 3 : 'auto' }}>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary="Ред. клетки" sx={{ opacity: openDrawer ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
      </List>
      <SearchModal
        openModal={openSearchModal}
        setOpenModal={setOpenSearchModal}
        setLoading={setLoading}
        setItems={setItems}
      />
      <EditModal
        openModal={openEditModal}
        setOpenModal={setOpenEditModal}
        setLoading={setLoading}
        checkedItems={checkedItems}
        items={items}
        setItems={setItems}
        setOpenCompleteModal={setOpenCompleteModal}
      />
    </Drawer>
  );
}
