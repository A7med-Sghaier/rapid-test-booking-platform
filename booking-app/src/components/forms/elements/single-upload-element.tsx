/*************************************************************
 * booking-app - single-upload-element.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 09.02.22 - 15:07
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { FormElementProps } from '../form-element';
import clsx from 'clsx';
import { Avatar, Box, Button, IconButton, Stack } from '@mui/material';
import { styled } from '@mui/styles';
import { imageToBase64 } from '../../../utils/file-utils';
import { DataFormContext } from '../../../contexts/forms/data-form-context';

interface UploadElementProps extends FormElementProps {}

export const SingleUploadElement: React.FC<UploadElementProps> = ({
  children,
  element,
  formKey,
  value,
  groupKey,
  isDeepElement,
  onDeepChange,
}) => {
  const [fileB64, setFileB64] = useState<string>();
  const { formValues, setFormValue } = useContext(DataFormContext);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const uploadedIcon = event.target.files[0];
      imageToBase64(uploadedIcon).then((data) => setFileB64(data as string));
    }
  };

  useEffect(() => {
    if (value || element.defaultValue) {
      setFileB64(value || element.defaultValue);
    }

    if (!isDeepElement && !formValues[element.key] && !!value) {
      setFormValue(element.key, value);
    }
  }, [value]);

  useEffect(() => {
    if (isDeepElement && onDeepChange) {
      onDeepChange(element.key, fileB64);
    } else {
      setFormValue(element.key, fileB64);
    }
  }, [fileB64]);

  return (
    <Box className={clsx(element.cssClasses)}>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center">
        {element.showImage && (
          <Avatar
            alt="Remy Sharp"
            src={fileB64 || ''}
            sx={element.logoViewStyle}
          />
        )}
        <label htmlFor="icon-button-file">
          <Input
            onChange={handleChange}
            accept={element.accept as string}
            multiple={element.multiple}
            id="icon-button-file"
            type="file"
          />
          {element.IconButton && (
            <IconButton
              color="primary"
              aria-label="upload-btn"
              component="span">
              <element.IconButton sx={{ color: '#6790A0' }} />
            </IconButton>
          )}
          {!element.IconButton && (
            <Button variant="contained" component="span">
              Upload
            </Button>
          )}
        </label>
      </Stack>
    </Box>
  );
};

const Input = styled('input')({
  display: 'none',
});
