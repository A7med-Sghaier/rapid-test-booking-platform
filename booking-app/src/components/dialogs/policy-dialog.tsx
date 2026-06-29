/*************************************************************
 * booking-app - policy-dialog.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 17.01.22 - 21:09
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React from 'react';
import { Box, Dialog, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface PolicyDialogProps {
  onClose: () => void;
  open: boolean;
  title: string;
  content: string;
}
export const PolicyDialog: React.FC<PolicyDialogProps> = ({
  children,
  onClose,
  title,
  content,
  open,
}) => {
  const { t } = useTranslation();
  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = (value: string) => {
    onClose();
  };

  return (
    <Dialog className={clsx('policy-dialog')} onClose={handleClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <Box className={clsx('p-4')}>{content}</Box>
    </Dialog>
  );
};
