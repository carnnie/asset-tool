import { Close } from '@mui/icons-material';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

interface Props {
  params: { [key: string]: any };
  handleCancelInv: (invId: string) => void;
  handleCloseInv: (invId: string, invName: string, storeNum: string) => void;
}

export function InventMenu({ params, handleCancelInv, handleCloseInv }: Props) {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const showMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorEl !== event.currentTarget) {
      setAnchorEl(event.currentTarget);
    }
  };

  return (
    <Box>
      <Button onClick={showMenu}>
        <Close sx={{ color: 'gray' }} />
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleCancelInv(params.row.id)}>Отменить</MenuItem>
        <MenuItem
          onClick={() => handleCloseInv(params.row.id, params.row.InventoryID, params.row.InventoryStore)}
        >
          Закрыть
        </MenuItem>
      </Menu>
    </Box>
  );
}
