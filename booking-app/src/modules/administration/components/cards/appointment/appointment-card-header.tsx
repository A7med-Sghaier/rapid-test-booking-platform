/*************************************************************
 * booking-app - appointment-card-header.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 28.01.22 - 22:39
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React from 'react';
import { Box, Chip } from '@mui/material';
import clsx from 'clsx';
import { TestData } from '../../../resources/interfaces';

interface AppointmentCardHeaderProps {
  testData: TestData;
}

export const AppointmentCardHeader: React.FC<AppointmentCardHeaderProps> = ({
  children,
  testData,
}) => {
  return (
    <Box
      className={clsx('d-flex justify-content-center fw-bold mb-2')}
      sx={{ fontSize: '0.95rem' }}>
      {testData.appointmentUid}
    </Box>
  );
};
