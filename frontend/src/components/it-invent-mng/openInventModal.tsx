import { Autocomplete, Backdrop, Box, Button, Fade, Modal, TextField, Typography } from '@mui/material';
import { Options } from '../../pages/it-invent-mng/itInventMng';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';

interface Props {
  stores: Array<Options>;
  selectedStore: Options | undefined;
  setSelectedStore: React.Dispatch<React.SetStateAction<Options | undefined>>;
  handleOpenInv: () => void;
}

export function OpenInventModal({ stores, selectedStore, setSelectedStore, handleOpenInv }: Props) {
  const [openModal, setOpenModal] = useState<boolean>(false);

  const closeModal = () => {
    setOpenModal(false);
    setSelectedStore(undefined);
  }

  return (
    <>
      <Button variant="contained" color="success" onClick={() => setOpenModal(true)}>
        <AddIcon />
        Открыть инвентаризацию
      </Button>
      <Modal
        open={openModal}
        onClose={closeModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 500,
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 24,
              p: 2,
            }}
          >
            <Box sx={{ borderBottom: '1px solid #DFDFDF', pb: 2 }}>
              <Typography variant="h5">Открыть инвентаризацию</Typography>
            </Box>
            <Box sx={{ py: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                Выберите номер магазина
              </Typography>
              <Typography variant="body2">
                Доступны только те ТЦ, в которых в данный момент нет открытой инвентаризации.
              </Typography>
              <Autocomplete
                options={stores}
                sx={{ width: 1, mt: 2 }}
                renderInput={(params) => <TextField {...params} label="ТЦ" />}
                onChange={(_, value) => {
                  setSelectedStore(value || undefined);
                }}
              />
            </Box>
            <Box
              sx={{
                borderTop: '1px solid #DFDFDF',
                pt: 2,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Button variant="contained" onClick={closeModal}>
                Назад
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="success"
                onClick={() => {
                  handleOpenInv();
                  setOpenModal(false);
                }}
                disabled={!selectedStore}
              >
                Начать инвентаризацию
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
