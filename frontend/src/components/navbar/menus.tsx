import { useContext, useState } from 'react';
import { user, UserContext } from '../../App';
import { Link } from 'react-router-dom';

import {
  Box,
  Button,
  Divider,
  Fade,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

import logo from '../../assets/logo.svg';

export function LeftMenu() {
  const theme = useTheme();
  const [anchorLeftMenu, setAnchorLeftMenu] = useState<null | HTMLElement>(null);
  const [anchorITAccounting, setAnchorITAccounting] = useState<null | HTMLElement>(null);

  const handleCloseAll = () => {
    setAnchorLeftMenu(null);
    setAnchorITAccounting(null);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        component={Link}
        to="/"
        sx={{
          '&:hover': {
            backgroundColor: '#004798',
          },
        }}
      >
        <img src={logo} alt="Metro" height="36px" />
      </Button>
      <Button
        startIcon={<MenuIcon />}
        onClick={(e) => setAnchorLeftMenu(e.currentTarget)}
        sx={{
          fontWeight: 'bold',
          textTransform: 'capitalize',
          fontSize: 15,
          color: 'inherit',
          '&:hover': {
            backgroundColor: '#004798',
          },
        }}
      >
        Меню
      </Button>
      <Menu
        anchorEl={anchorLeftMenu}
        open={Boolean(anchorLeftMenu)}
        onClose={() => setAnchorLeftMenu(null)}
        sx={{ mt: '5px', zIndex: Math.max(...Object.values(theme.zIndex)) + 2 }}
        disableAutoFocusItem
        keepMounted
        TransitionComponent={Fade}
      >
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem onClick={handleCloseAll}>
            <ListItemIcon>
              <HomeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Главное меню</ListItemText>
          </MenuItem>
        </Link>
        <Divider sx={{ my: 1 }} />
        <Link to="/mobile" style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem onClick={handleCloseAll}>Учет моб. оборудования</MenuItem>
        </Link>
        <MenuItem onClick={(e) => setAnchorITAccounting(e.currentTarget)}>
          <Typography>
            Учет IT оборудования
            <KeyboardDoubleArrowRightIcon fontSize="small" sx={{ verticalAlign: 'text-top', ml: 2 }} />
          </Typography>
        </MenuItem>
        <Link to="/it-utilization" style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem onClick={handleCloseAll}>Утилизация</MenuItem>
        </Link>
      </Menu>
      <Menu
        anchorEl={anchorITAccounting}
        open={Boolean(anchorITAccounting)}
        onClose={() => setAnchorITAccounting(null)}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{ zIndex: Math.max(...Object.values(theme.zIndex)) + 2 }}
      >
        <Link to="/it-invent-mng" style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem onClick={handleCloseAll}>Управление IT инвентаризациями</MenuItem>
        </Link>
        <Link to="/single-edit" style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem onClick={handleCloseAll}>Редактирование одной единицы</MenuItem>
        </Link>
        <Link to="/group-edit" style={{ textDecoration: 'none', color: 'inherit' }}>
          <MenuItem onClick={handleCloseAll}>Групповое редактирование</MenuItem>
        </Link>
      </Menu>
    </Box>
  );
}

export function RightMenu() {
  const theme = useTheme();
  const user = useContext<user>(UserContext);
  const [anchorRightMenu, setAnchorRightMenu] = useState<null | HTMLElement>(null);
  const [anchorRoles, setAnchorRoles] = useState<null | HTMLElement>(null);

  return (
    <Box>
      <Box
        sx={{
          height: '36px',
          px: 1,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          textAlign: 'right',
          cursor: 'pointer',
          borderRadius: 2,
          '&:hover': {
            backgroundColor: '#004798',
          },
        }}
        onClick={(e) => setAnchorRightMenu(e.currentTarget)}
      >
        <Box>
          <Typography variant="subtitle2" fontSize={'15px'}>
            <b>{user.username}</b>
          </Typography>
          <Typography variant="caption" display="block" fontSize={'10px'}>
            {user.store_role.length ? <i>ТЦ:({user.store_role.join(', ')})</i> : <i> </i>}
          </Typography>
        </Box>
        <KeyboardDoubleArrowDownIcon />
      </Box>
      <Menu
        open={Boolean(anchorRightMenu)}
        anchorEl={anchorRightMenu}
        onClose={() => setAnchorRightMenu(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ mt: '5px', zIndex: Math.max(...Object.values(theme.zIndex)) + 2 }}
        disableAutoFocusItem
        keepMounted
        TransitionComponent={Fade}
      >
        <MenuItem onClick={(e) => setAnchorRoles(e.currentTarget)}>
          <ListItemIcon>
            <MenuOpenIcon />
          </ListItemIcon>
          <ListItemText>Роли</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            location.href = '/auth/logout';
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText>Выход из системы</ListItemText>
        </MenuItem>
      </Menu>
      <Menu
        open={Boolean(anchorRoles)}
        anchorEl={anchorRoles}
        onClose={() => setAnchorRoles(null)}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{ zIndex: Math.max(...Object.values(theme.zIndex)) + 2 }}
      >
        <Box px={1} sx={{ whiteSpace: 'pre-line' }}>
          <Typography variant="caption">
            {user.roles.length > 0 ? user.roles.join('\n') : 'Ролей нет'}
          </Typography>
        </Box>
      </Menu>
    </Box>
  );
}
