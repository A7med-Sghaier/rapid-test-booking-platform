/*************************************************************
 * booking-app - today-appointment-card.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 27.01.22 - 22:08
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React from 'react';
import { Box, Card, CardContent, Chip, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { APPOINTMENT_STATUS } from '../../../../test_reservation/contexts/appointment/booking-context';
import clsx from 'clsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Bookmark,
  BookmarkAdd,
  BookmarkRemove,
  LocalPrintshop,
} from '@mui/icons-material';
import { AppointmentCardPerson } from './appointment-card-person';
import { TEST_RESULT, TestData } from '../../../resources/interfaces';
import { getPDFResult } from '../../../utils/appointment-utils';

interface CompletedTestCardProps {
  testData: TestData;
}
export const CompletedTestCard: React.FC<CompletedTestCardProps> = ({
  children,
  testData,
}) => {
  const { t } = useTranslation();

  const closePrint = (printElmnt: HTMLElement) => {
    document.body.removeChild(printElmnt);
  };

  const printPdfResult = () => {
    getPDFResult(testData.person.uid as string).then((response) => {
      const blobArr = new Uint8Array(response.data);
      const blob = new Blob([blobArr], {
        type: 'application/pdf',
      });
      const pdfUrl = URL.createObjectURL(blob);
      const pdfFrame = document.getElementById(
        'result-view'
      ) as HTMLIFrameElement;
      if (pdfFrame) {
        pdfFrame.src = pdfUrl;
        pdfFrame.onload = function () {
          if (pdfFrame.contentWindow) {
            pdfFrame.contentWindow.focus(); // Required for IE
            pdfFrame.contentWindow.print();
          }
        };
      }
    });
  };

  return (
    <Card
      raised
      className={clsx('position-relative flex-grow-1 d-flex flex-column')}>
      <CardContent
        className={clsx('pb-0 flex-grow-1 ')}
        sx={{ fontSize: '0.85rem' }}>
        <Box className={clsx('')} sx={{ opacity: '0.5' }}>
          {testData.person.status === APPOINTMENT_STATUS.TEST_PERFORMED &&
            testData.person.testResult === TEST_RESULT.POSITIVE && (
              <BookmarkAdd
                sx={{ fontSize: '1.5rem', color: 'rgba(193, 39, 40, .8)' }}
                className={clsx('position-absolute top-0 start-0')}
              />
            )}
          {testData.person.status === APPOINTMENT_STATUS.TEST_PERFORMED &&
            testData.person.testResult === TEST_RESULT.NEGATIVE && (
              <BookmarkRemove
                sx={{ fontSize: '1.5rem', color: 'rgba(16, 149, 15,1)' }}
                className={clsx('position-absolute top-0 start-0')}
              />
            )}
          {testData.person.status === APPOINTMENT_STATUS.TEST_PERFORMED &&
            testData.person.testResult === TEST_RESULT.INVALID && (
              <Bookmark
                sx={{ fontSize: '1.5rem', color: 'rgba(159,159,159,0.6)' }}
                className={clsx('position-absolute top-0 start-0')}
              />
            )}
          <LocalPrintshop
            onClick={printPdfResult}
            sx={{
              cursor: 'pointer',
              fontSize: '1.8rem',
              color: 'rgb(100,100,100)',
            }}
            className={clsx('fw-bold position-absolute mt-1 me-2 top-0 end-0')}
          />
        </Box>
        <Box className={clsx('mt-4 mb-3')} sx={{ opacity: '0.5' }}>
          <AppointmentCardPerson person={testData.person} />
        </Box>
        <Box className={clsx('mt-2 mb-3 d-flex justify-content-between')}>
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
    </Card>
  );
};
