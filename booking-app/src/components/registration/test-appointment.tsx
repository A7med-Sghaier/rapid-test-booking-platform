/*************************************************************
 * booking-app - test-booking-context.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 15.01.22 - 22:58
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React from 'react';
import { AppointmentSlotsProvider } from '../../modules/test_reservation/contexts/appointment/appointment-slots-context';
import { SlotsList } from './slots-list';
import { Box } from '@mui/material';

interface TestAppointmentProps {
  onSelect: () => void;
}

export const TestAppointment: React.FC<TestAppointmentProps> = ({
  onSelect,
}) => {
  return (
    <Box>
      <AppointmentSlotsProvider>
        <SlotsList onSelect={onSelect} />
      </AppointmentSlotsProvider>
    </Box>
  );
};
