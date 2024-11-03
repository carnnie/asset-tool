import { Box, Fade, Modal, Stack, Typography, useTheme } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useEffect } from 'react';

interface Props {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
}

export function CompleteModal({ openModal, setOpenModal, text }: Props) {
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpenModal(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [openModal]);

  return (
    <Modal
      open={openModal}
      onClose={() => setOpenModal(false)}
      closeAfterTransition
      sx={{ zIndex: Math.max(...Object.values(theme.zIndex)) + 2 }}
    >
      <Fade in={openModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 5,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Stack alignItems="center" mb={2}>
            <VerifiedIcon color="success" sx={{ width: 70, height: 70 }} />
          </Stack>
          <Typography variant="h6" align="center">
            {text}
          </Typography>
        </Box>
      </Fade>
    </Modal>
  );
}
