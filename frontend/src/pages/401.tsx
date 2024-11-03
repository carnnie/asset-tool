import request from '../assets/request.png';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

export default function UserRights({}) {
  return (
    <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} height={'90vh'}>
      <Box textAlign={'center'}>
        <Typography>К сожалению у Вас нет доступа к данному ресурсу!</Typography>
        <Typography>
          Для его получения создайте заявку на&nbsp;<Link href="https://jira.metro-cc.ru/servicedesk/customer/portal/281/create/662">порталe</Link>
        </Typography>
        <img src={request} style={{ maxWidth: ' 75%' }}></img>/
      </Box>
    </Box>
  );
}
