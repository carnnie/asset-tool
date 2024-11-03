// MUI imports
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material';
import { LeftMenu, RightMenu } from './menus';
import { useLocation } from 'react-router-dom';

// Управление материальными активами компании

const titles = {
  '/': 'Управление материальными активами компании',
  '/mobile': 'Учет мобильного оборудования',
  '/it-invent': 'Проведение ИТ инвентаризаций',
  '/it-utilization': 'ИТ утилизация',
  '/single-edit': 'Редактирование одной единицы',
  '/group-edit': 'Групповое редактирование',
  '/it-invent-mng': 'Управление ИТ инвентаризациями',
};

export default function Navbar() {
  const theme = useTheme();
  const location = useLocation();

  return (
    <AppBar
      position="relative"
      sx={{ backgroundColor: '#003B7E', padding: 0, zIndex: Math.max(...Object.values(theme.zIndex)) + 2 }}
    >
      <Toolbar
        variant="dense"
        sx={{ display: 'flex', justifyContent: 'space-between', flexGrow: 1, px: '10px !important' }}
      >
        <LeftMenu />
        <Typography
          variant="caption"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit', fontSize: 15, ml: -3 }}
        >
          {titles[location.pathname as keyof typeof titles]}
        </Typography>
        <RightMenu />
      </Toolbar>
    </AppBar>
  );
}
