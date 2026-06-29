/*************************************************************
 * booking-app - today-appointment-card.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 27.01.22 - 22:08
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useRef } from 'react';
import { Box, Card, CardActions, CardContent, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ColorButton } from '../../../../../components/buttons/buttons';
import { AppointmentCardPerson } from './appointment-card-person';
import { PersonPropsForAdmin, TestData } from '../../../resources/interfaces';
import {
  cancelAppointment,
  checkInAppointment,
} from '../../../utils/appointment-utils';
import { AuthContext } from '../../../../../contexts/auth/auth-context';

interface TodayAppointmentCardProps {
  testData: TestData;
}
export const TodayAppointmentCard: React.FC<TodayAppointmentCardProps> = ({
  children,
  testData,
}) => {
  const { t } = useTranslation();
  const { getIdentity } = useContext(AuthContext);

  const handleCheckin = () => {
    getIdentity().then((agent) => {
      if (testData.person.uid) {
        checkInAppointment(
          testData.appointmentUid,
          testData.person.uid,
          agent.id
        );
      }
    });
  };

  const handleCancel = () => {
    getIdentity().then((agent) => {
      if (testData.person.uid) {
        cancelAppointment(
          testData.appointmentUid,
          [testData.person.uid],
          agent.id
        );
      }
    });
  };

  return (
    <Card raised className={clsx('flex-grow-1 d-flex flex-column')}>
      <CardContent
        className={clsx('pb-0 flex-grow-1 ')}
        sx={{ fontSize: '0.85rem' }}>
        <Box className={clsx('mt-1 mb-3')} sx={{ opacity: '0.5' }}>
          <AppointmentCardPerson person={testData.person} />
        </Box>
        <Box className={clsx('mt-2 d-flex justify-content-between')}>
          <Chip
            className={clsx('p-0 fw-bold')}
            sx={{ backgroundColor: 'rgba(0,145,125,0.3)' }}
            label={
              <Box>
                {testData.testType.label}
                {!!testData.testType.price && `: ${testData.testType.price}€`}
              </Box>
            }
          />
          <Box>
            <Chip
              label={
                <Box className={clsx('fw-bold')} sx={{ fontSize: '0.9rem' }}>
                  {format(new Date(testData.appointment), 'HH:mm', {
                    locale: de,
                  })}
                </Box>
              }
            />
            <Box className={clsx('fw-bold')} sx={{ fontSize: '0.5rem' }}>
              {format(new Date(testData.appointment), 'dd.MM.yyyy', {
                locale: de,
              })}
            </Box>
          </Box>
        </Box>
      </CardContent>
      <CardActions>
        <Box className={clsx('w-100 px-1 d-flex justify-content-between')}>
          <ColorButton
            className={clsx('px-2')}
            onClick={handleCheckin}
            sx={{ minWidth: '40%', backgroundColor: '#617c85' }}
            size="small">
            {t('admin.checkin')}
          </ColorButton>
          <ColorButton
            className={clsx('px-2')}
            onClick={handleCancel}
            size="small"
            sx={{ minWidth: '40%', backgroundColor: ' rgba(193, 39, 40, .8)' }}>
            {t('admin.remove')}
          </ColorButton>
        </Box>
      </CardActions>
    </Card>
  );
};
