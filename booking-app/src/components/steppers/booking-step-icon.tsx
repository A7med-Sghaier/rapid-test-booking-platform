/*************************************************************
 * booking-app - booking-step-icon.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 18.01.22 - 21:28
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useCallback } from 'react';
import { BookingSteps } from '../../modules/test_reservation/pages/registration';
import { Box, Fab, Step, StepButton, Stepper, SvgIcon } from '@mui/material';
import clsx from 'clsx';
import { ThemeBlue } from '../../themes/theme-blue';
import {
  Adjust,
  CalendarTodayRounded,
  Check,
  CheckCircle,
  DirectionsWalk,
  Person,
  RadioButtonCheckedRounded,
  SvgIconComponent,
} from '@mui/icons-material';

interface BookingStepperProps {
  activeStep: string;
  step: { idx: number; label: string };
  completed: boolean;
}
export const BookingStepIcon: React.FC<BookingStepperProps> = ({
  children,
  activeStep,
  completed,
  step,
}) => {
  const iconColor = activeStep === step.label ? '#fff' : ThemeBlue.primary.main;
  const stepperBg = completed
    ? '#008313'
    : activeStep === step.label
    ? ThemeBlue.secondary.light
    : '#c4c4c4';
  const getIcon = useCallback(() => {
    if (completed === true) {
      return (
        <Check
          className={clsx('p-0 m-0')}
          sx={{ fontSize: '1rem', color: '#fff' }}
        />
      );
    }

    let Icon: SvgIconComponent | undefined;
    switch (step.label) {
      case BookingSteps.TEST_TYPE:
        Icon = DirectionsWalk;
        break;
      case BookingSteps.SELECT_APPOINTMENT:
        Icon = CalendarTodayRounded;
        break;
      case BookingSteps.ADD_PERSONS:
        Icon = Person;
        break;
      default:
        Icon = undefined;
    }
    if (Icon) {
      return (
        <Icon
          className={clsx('p-0 m-0')}
          sx={{ fontSize: '1rem', color: iconColor }}
        />
      );
    }
  }, [completed, activeStep]);

  return (
    <Fab
      component="div"
      className={clsx('booking-step-icon p-0 m-0')}
      sx={{
        background: stepperBg,
        width: '1.6rem',
        height: '1.6rem',
        minHeight: '1rem',
      }}>
      {getIcon()}
    </Fab>
  );
};

/**
 * <BookingStepIcon
 *                         key={`step-${label}`}
 *                         activeStep={activeStep as string}
 *                         step={{ idx: index, label: label }}
 *                         completed={false}
 *                       />
 */
