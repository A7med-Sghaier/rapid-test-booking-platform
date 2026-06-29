/*************************************************************
 * booking-app - slot-time.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 16.01.22 - 00:16
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext } from 'react';
import { compareAsc, format } from 'date-fns';
import { BookingContext } from '../../modules/test_reservation/contexts/appointment/booking-context';
import { ColorButton } from '../buttons/buttons';
import { Check } from '@mui/icons-material';
import clsx from 'clsx';

interface SlotTimeProps {
  date: Date;
  onSelect: () => void;
}
export const SlotTime: React.FC<SlotTimeProps> = ({ date, onSelect }) => {
  const { appointment, setAppointment } = useContext(BookingContext);

  return (
    <ColorButton
      className={clsx(
        appointment && compareAsc(date, appointment) === 0 ? 'selected' : ''
      )}
      variant="contained"
      onClick={() => {
        setAppointment(date);
        onSelect();
      }}>
      {appointment && compareAsc(date, appointment) === 0 && (
        <Check
          className={clsx(' position-absolute ')}
          sx={{
            top: '2px',
            right: '2px',
            fontSize: '0.8rem',
            color: '#008313',
          }}
        />
      )}
      {format(date, 'HH:mm')}
    </ColorButton>
  );
};
