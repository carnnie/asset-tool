import { List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { Hardware } from '../../utilities/interfaces';

interface Props {
  results: Array<Hardware>;
  setSelectedItem: React.Dispatch<React.SetStateAction<Hardware | undefined>>;
}

export function SearchResults({ results, setSelectedItem }: Props) {
  return (
    <List>
      {results.map((item, index) => (
        <ListItem disablePadding key={index} divider>
          <ListItemButton onClick={() => setSelectedItem(item)}>
            <ListItemText
              primary={item.Model}
              secondary={
                <>
                  <Typography component="span">
                    {`INV No: ${item['INV No']}`}
                    <br />
                  </Typography>
                  <Typography component="span">{`Serial No: ${item['Serial No']}`}</Typography>
                </>
              }
              primaryTypographyProps={{ fontSize: '14px', fontWeight: 'bold' }}
              secondaryTypographyProps={{ fontSize: '13px' }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
