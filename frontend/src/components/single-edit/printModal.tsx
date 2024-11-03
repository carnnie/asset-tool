import { Alert, Autocomplete, Box, Button, Divider, Modal, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { Hardware } from '../../utilities/interfaces';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import { PrinterOption } from '../../pages/single-edit/singleEdit';

interface Props {
  printerList: Array<PrinterOption>;
  item: Hardware;
}

export function PrintModal({ printerList, item }: Props) {
  const [openModal, setOpenModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState(200);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterOption | null>(null);

  const closeModal = () => {
    setSelectedPrinter(null);
    setOpenModal(false);
    setShowAlert(false);
  };

  const printLabel = () => {
    axios.post('/single-edit/print/', { printer: selectedPrinter, item: item }).then((response) => {
      setShowAlert(true);
      setAlertType(response.data.result);
    });
  };

  return (
    <>
      <Button variant="contained" color="info" onClick={() => setOpenModal(true)}>
        Печать инвентарной этикетки
      </Button>
      <Modal open={openModal} onClose={closeModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            px: 3,
            py: 2,
          }}
        >
          <Box sx={{ borderBottom: '1px solid #DFDFDF', pb: 1 }}>
            <Typography variant="h6">Выберите принтер</Typography>
          </Box>
          <Divider />
          <Autocomplete
            options={printerList}
            sx={{ width: 1, py: 3 }}
            renderInput={(params) => <TextField {...params} label="Принтер" />}
            // value={UserList.filter((obj) => fields.User && obj.label.includes(fields.User))[0] || null}
            onChange={(_, value) => setSelectedPrinter(value)}
          />
          <Divider />
          <Box sx={{ pt: 2, display: 'flex', justifyContent: 'end', gap: 2, position: 'relative' }}>
            {showAlert && (
              <Alert
                sx={{ width: '40%', height: 40, position: 'absolute', bottom: 0, left: 0, py: 0 }}
                icon={alertType === 200 ? <CheckIcon fontSize="inherit" /> : <ErrorIcon fontSize="inherit" />}
                severity={alertType === 200 ? 'success' : 'error'}
                variant="filled"
                onClose={() => {
                  setShowAlert(false);
                }}
              >
                {alertType === 200 ? 'Done.' : 'Error.'}
              </Alert>
            )}
            <Button variant="contained" color="info" onClick={closeModal}>
              Назад
            </Button>
            <Button variant="contained" color="success" disabled={!selectedPrinter} onClick={printLabel}>
              Печать
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
