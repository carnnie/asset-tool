import { Card, CardContent, Grid, Typography } from '@mui/material';
import { Hardware } from '../../utilities/interfaces';

interface Props {
  item: Hardware;
}

export function Labels({ item }: Props) {
  return (
    <Grid p={2} container spacing={2} sx={{ boxSizing: 'border-box' }}>
      <Grid item xs={3}>
        <Card variant="outlined" sx={{ height: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
              INV No
            </Typography>
            <Typography variant="subtitle2" fontSize="14px">
              {item['INV No']}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card variant="outlined" sx={{ height: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
              Serial No
            </Typography>
            <Typography variant="subtitle2" fontSize="14px">
              {item['Serial No']}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card variant="outlined" sx={{ height: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
              Type
            </Typography>
            <Typography variant="subtitle2" fontSize="14px">
              {item['Type']}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card variant="outlined" sx={{ height: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
              Model
            </Typography>
            <Typography variant="subtitle2" fontSize="14px">
              {item['Model']}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
