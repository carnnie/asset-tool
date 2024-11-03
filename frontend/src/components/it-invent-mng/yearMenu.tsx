import { Box, Button, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface Props {
  years: Array<string | undefined>;
  yearFilter: string | undefined;
  setYearFilter: React.Dispatch<React.SetStateAction<string>>;
}

export function YearMenu({ years, yearFilter, setYearFilter }: Props) {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const showMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorEl !== event.currentTarget) {
      setAnchorEl(event.currentTarget);
    }
  };

  const filterInvs = (year: string) => {
    setYearFilter(year);
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button variant="outlined" onClick={showMenu}>
        Год <KeyboardArrowDownIcon />
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => filterInvs('')} disabled={yearFilter === ''}>
          Все
        </MenuItem>
        {years.map((year, index) => (
          <MenuItem key={index} onClick={() => filterInvs(year || '')} disabled={yearFilter === year}>
            {year}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
