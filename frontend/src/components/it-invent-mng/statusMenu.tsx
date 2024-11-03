import { Button, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface Props {
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
}

export function StatusMenu({ statusFilter, setStatusFilter }: Props) {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const showMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorEl !== event.currentTarget) {
      setAnchorEl(event.currentTarget);
    }
  };

  const filterInvs = (event: React.MouseEvent<HTMLLIElement>) => {
    const el = event.target as HTMLLIElement
    setStatusFilter(el.getAttribute('data-value') || '');
    setAnchorEl(null);
  };

  return (
    <>
      <Button variant="outlined" onClick={showMenu}>
        Статус <KeyboardArrowDownIcon />
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={filterInvs} data-value="" disabled={statusFilter === ""}>
          Все
        </MenuItem>
        <MenuItem onClick={filterInvs} data-value="Open" disabled={statusFilter === "Open"}>
          Открытые
        </MenuItem>
        <MenuItem onClick={filterInvs} data-value="Close" disabled={statusFilter === "Close"}>
          Закрытые
        </MenuItem>
      </Menu>
    </>
  );
}
