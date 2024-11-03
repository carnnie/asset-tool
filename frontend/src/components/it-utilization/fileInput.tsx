import { Button, styled } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from 'react';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export function FileInput({ setFile }: { setFile: React.Dispatch<React.SetStateAction<File | string>> }) {
  const [uploaded, setUploaded] = useState<boolean>(false);

  const onFileChange = (event: React.FormEvent) => {
    const files = (event.target as HTMLInputElement).files;

    if (files && files.length > 0) {
      setFile(files[0]);
    }

    setUploaded(true);
  };

  return (
    <Button
      component="label"
      role={undefined}
      variant={uploaded ? 'outlined' : 'contained'}
      tabIndex={-1}
      startIcon={<CloudUploadIcon />}
      onChange={onFileChange}
    >
      {uploaded ? 'Файл загружен' : 'Загрузить файл'}
      <VisuallyHiddenInput type="file" />
    </Button>
  );
}
