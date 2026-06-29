/*************************************************************
 * booking-app - test-types.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 15.01.22 - 21:48
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext } from 'react';
import { Box, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BookingContext } from '../../modules/test_reservation/contexts/appointment/booking-context';
import clsx from 'clsx';
import { ThemeBlue } from '../../themes/theme-blue';
import { GlobalAppContext } from '../../contexts/global-app-context';

interface TestTypesProps {
  onSelect: () => void;
}

export const TestTypes: React.FC<TestTypesProps> = ({ onSelect }) => {
  const { t } = useTranslation();
  const { testType, setTestType } = useContext(BookingContext);
  const { center } = useContext(GlobalAppContext);

  return (
    <Box
      className={clsx(
        'w-100 h-100 d-flex flex-column justify-content-center align-items-center'
      )}
      gap="2rem">
      {center &&
        center.testTypes
          .filter((item) => !!item.isActive)
          .map((item) => (
            <Paper
              className={clsx('w-75  ')}
              key={`test-${item.label}`}
              elevation={2}>
              <Box
                className={clsx(
                  'rounded w-100 p-4 fw-bold w-md-50 d-flex justify-content-between align-items-center '
                )}
                sx={{
                  fontSize: '1rem',
                  border:
                    testType && testType.label === item.label
                      ? '3px solid ' + ThemeBlue.primary.main
                      : '',
                }}
                onClick={() => {
                  setTestType(item);
                  onSelect();
                }}>
                <Box className={clsx('text-upper p-2')}>{item.label}</Box>
                <span>{item.price} €</span>
              </Box>
            </Paper>
          ))}
    </Box>
  );
};
