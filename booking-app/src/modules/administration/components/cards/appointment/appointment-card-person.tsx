/*************************************************************
 * booking-app - appointment-card-person.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 28.01.22 - 22:46
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React from 'react';
import { Box } from '@mui/material';
import clsx from 'clsx';
import { Person } from '@mui/icons-material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { PersonPropsForAdmin } from '../../../resources/interfaces';

interface AppointmentCardPersonsProps {
  person: PersonPropsForAdmin;
}

export const AppointmentCardPerson: React.FC<AppointmentCardPersonsProps> = ({
  children,
  person,
}) => {
  return (
    <Box
      className={clsx(
        'fw-bold w-100 d-flex justify-content-between align-items-center'
      )}>
      <Box className={clsx('d-flex align-items-center')}>
        <Person className={clsx('fw-bold')} sx={{ fontSize: '1.2rem' }} />
        <Box className={clsx('ms-2 fw-bold')} sx={{ fontSize: '1rem' }}>
          {person.firstName} {person.secondName}
        </Box>
      </Box>
      <Box>
        {format(new Date(person.birthDate), 'dd.MM.yyyy', {
          locale: de,
        })}
      </Box>
    </Box>
  );
};
