/*************************************************************
 * booking-app - today-appointment-card.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 27.01.22 - 22:08
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { differenceInSeconds, format, parse, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { ColorButton } from '../../../../../components/buttons/buttons';
import { AppointmentCardHeader } from './appointment-card-header';
import { AppointmentCardPerson } from './appointment-card-person';
import { TEST_RESULT, TestData } from '../../../resources/interfaces';
import { emitTestResult } from '../../../utils/test-utils';
import { CheckedInTimeCounterProgress } from './checked-in-time-counter-progress';
import { checkInAppointment } from '../../../utils/appointment-utils';
import { AuthContext } from '../../../../../contexts/auth/auth-context';
import { GlobalAppContext } from '../../../../../contexts/global-app-context';
import { TestKit } from '../../../../../interfaces/booking-interface';

interface CheckedInCardProps {
  testData: TestData;
}
export const CheckedInCard: React.FC<CheckedInCardProps> = ({
  children,
  testData,
}) => {
  const { t } = useTranslation();
  const { getIdentity } = useContext(AuthContext);
  const { center } = useContext(GlobalAppContext);
  const [testKit, setTestKit] = useState<TestKit>();
  let checkInDate;
  if (testData.person.checkedInAt) {
    checkInDate = parseISO(testData.person.checkedInAt);
  }

  const handleEmitTestResult = (result: TEST_RESULT) => {
    getIdentity().then((agent) => {
      emitTestResult(
        testData.appointmentUid,
        testData.person.uid as string,
        result,
        testData.person,
        agent.id,
        testData,
        testKit?.label as string
      ).then((result) => {});
    });
  };

  useEffect(() => {
    if (center && center.testKits) {
      const activeTestKit = center.testKits.find((test) => test.isActive);
      if (activeTestKit) {
        setTestKit(activeTestKit);
      }
    }
  }, [center]);

  return (
    <Card raised className={clsx('flex-grow-1 d-flex flex-column')}>
      <CardContent
        className={clsx('pb-0 flex-grow-1 position-relative')}
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
        <Box sx={{ opacity: '0.5' }}>
          {checkInDate && (
            <Box className={clsx('w-100 py-2')}>
              <Box className={clsx('fw-bold')}>
                <span>{t('admin.checkedInAt')}: </span>
                {format(checkInDate, 'hh:mm')}
              </Box>
            </Box>
          )}
        </Box>
        {!!checkInDate &&
          differenceInSeconds(new Date(), checkInDate) < 1200 && (
            <CheckedInTimeCounterProgress checkinDate={checkInDate} />
          )}
      </CardContent>
      <CardActions>
        <Box className={clsx('w-100 px-1 d-flex justify-content-between')}>
          <ColorButton
            className={clsx('px-2')}
            sx={{
              minWidth: '30%',
              backgroundColor: '#617c85',
            }}
            onClick={() => {
              handleEmitTestResult(TEST_RESULT.NEGATIVE);
            }}
            size="small">
            {t('test.negative')}
          </ColorButton>
          <ColorButton
            onClick={() => {
              handleEmitTestResult(TEST_RESULT.INVALID);
            }}
            className={clsx('px-2')}
            size="small"
            sx={{
              minWidth: '30%',
              backgroundColor: ' rgba(139, 143, 145, 1)',
            }}>
            {t('test.invalid')}
          </ColorButton>
          <ColorButton
            className={clsx('px-2')}
            size="small"
            onClick={() => {
              handleEmitTestResult(TEST_RESULT.POSITIVE);
            }}
            sx={{ minWidth: '30%', backgroundColor: ' rgba(193, 39, 40, .8)' }}>
            {t('test.positive')}
          </ColorButton>
        </Box>
      </CardActions>
    </Card>
  );
};

/**
 *
 *       <Box className={clsx('d-none d-flex- flex-column fw-bold')}>
 *         <Box
 *           className={clsx(
 *             'd-flex justify-content-between align-items-center fw-bold '
 *           )}>
 *           <Box sx={{ fontSize: '0.95rem' }}>{testData.appointmentUid}</Box>
 *           <Chip
 *             className={clsx('text-white')}
 *             sx={{ backgroundColor: ThemeBlue.primary.main }}
 *             label={format(new Date(testData.appointment), 'HH:mm', {
 *               locale: de,
 *             })}
 *           />
 *         </Box>
 *         <Box className={clsx('ms-auto')} sx={{ fontSize: '0.6rem' }}>
 *           {format(new Date(testData.appointment), 'dd.MM.yyyy', {
 *             locale: de,
 *           })}
 *         </Box>
 *       </Box>
 *
 *  <Card raised>
 *         <CardContent sx={{ fontSize: '0.85rem', opacity: '.6' }}>
 *           <Box
 *             className={clsx('d-flex justify-content-center fw-bold mb-2')}
 *             sx={{ fontSize: '0.95rem' }}>
 *             {testData.appointmentUid}
 *           </Box>
 *           <Divider />
 *           <Box className={clsx('mt-3 d-flex justify-content-between')}>
 *             <Box className={clsx('fw-bold')}>
 *               {firstPerson.firstName} {firstPerson.secondName}
 *             </Box>
 *             <Box className={clsx('fw-bold')}>
 *               <Box>
 *                 {format(new Date(testData.appointment), 'dd.MM.yyyy', {
 *                   locale: de,
 *                 })}
 *               </Box>
 *               <Box>
 *                 <Chip
 *                   className={clsx('text-white')}
 *                   sx={{ backgroundColor: ThemeBlue.primary.main }}
 *                   label={format(new Date(testData.appointment), 'HH:mm', {
 *                     locale: de,
 *                   })}></Chip>
 *               </Box>
 *             </Box>
 *           </Box>
 *         </CardContent>
 *         <CardActions>
 *           <Box className={clsx('mt-3 w-100 d-flex justify-content-around')}>
 *             <ColorButton className={clsx('px-2')} size="small">
 *               {t('admin.checkin')}
 *             </ColorButton>
 *             <ColorButton className={clsx('px-2')} size="small">
 *               {t('admin.remove')}
 *             </ColorButton>
 *           </Box>
 *         </CardActions>
 *       </Card>
 */
