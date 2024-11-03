import { Box, IconButton, Menu, Typography } from '@mui/material';
import React, { useState } from 'react';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { errors } from './utilizationTable';

interface Props {
  errors: errors;
  rows: Array<number>;
}

export function HelpMenu({ errors, rows }: Props) {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    if (anchorEl !== event.currentTarget) {
      setAnchorEl(event.currentTarget);
    }
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <Box
      borderRadius={4}
      sx={{
        '&:hover': {
          bgcolor: '#ec6a6a',
        },
      }}
    >
      <IconButton sx={{ color: '000000' }} onClick={handleClick}>
        <ErrorIcon sx={{ color: '#000000' }} />
        <ArrowDropDownIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <Box sx={{ px: 2 }}>
          {errors.inv_in_several_rows && (
            <Typography>
              {`Ошибка: инвентарный номер был найден в разных строках выгрузки SAP (ряды ${rows.join(', ')})`}
            </Typography>
          )}

          {errors.different_invs_in_same_row && (
            <Typography>
              {`Ошибка: у найденного оборудования указано несколько разных инвентарных номеров (ряд ${rows})`}
            </Typography>
          )}
        </Box>
      </Menu>
    </Box>
  );
}
