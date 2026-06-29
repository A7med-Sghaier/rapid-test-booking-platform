/*************************************************************
 * booking-app_ - registration.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 14.01.22 - 16:46
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  IconButton,
  Paper,
  Step,
  StepButton,
  Stepper,
  Typography,
} from '@mui/material';
import { TestTypes } from '../../../components/registration/test-types';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { BookingContext } from '../contexts/appointment/booking-context';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { TestPersons } from '../../../components/registration/test-persons';
import {
  CalendarTodayRounded,
  ChevronLeft,
  Close,
  DirectionsWalk,
  Person,
  Circle,
} from '@mui/icons-material';
import { TestAppointment } from '../../../components/registration/test-appointment';
import { ThemeBlue } from '../../../themes/theme-blue';
import { DataFormProvider } from '../../../contexts/forms/data-form-context';

const useStyles = makeStyles({
  root: {
    height: '100%',
    padding: '1rem',
  },
  mainContent: {
    flex: '1 auto',
  },
});

export enum BookingSteps {
  TEST_TYPE = 'test-type',
  SELECT_APPOINTMENT = 'select-appointment',
  ADD_PERSONS = 'add-persons',
}

const steps = [
  BookingSteps.TEST_TYPE,
  BookingSteps.SELECT_APPOINTMENT,
  BookingSteps.ADD_PERSONS,
];

export const Registration: React.FC = ({ children }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { testType, appointment, persons } = useContext(BookingContext);
  const navigate = useNavigate();
  const { '*': star, step: activeStep } = useParams();
  const refPrev = useRef('');
  const [validPersonData, setValidPersonData] = useState(false);
  const [completed, setCompleted] = React.useState<{
    [k: number]: boolean;
  }>({ 0: !!testType, 1: !!appointment });

  switch (activeStep) {
    case BookingSteps.TEST_TYPE:
      refPrev.current = '';
      break;
    case BookingSteps.SELECT_APPOINTMENT:
      refPrev.current = BookingSteps.TEST_TYPE;
      break;
    case BookingSteps.ADD_PERSONS:
      refPrev.current = BookingSteps.SELECT_APPOINTMENT;
      break;
  }

  // @ts-ignore
  const title = activeStep ? t(`registration.step.${activeStep}`) : '';

  const stepNavigation = (label: string) => {
    navigate(label);
  };

  useEffect(() => {
    if (testType) {
      setCompleted({ ...completed, 0: true });
    } else {
      setCompleted({ ...completed, 0: false });
    }
  }, [testType]);

  useEffect(() => {
    if (appointment) {
      setCompleted({ ...completed, 1: true });
    } else {
      setCompleted({ ...completed, 1: false });
    }
  }, [appointment]);

  useEffect(() => {
    if (validPersonData) {
      setCompleted({ ...completed, 2: true });
    } else {
      setCompleted({ ...completed, 2: false });
    }
  }, [validPersonData]);

  const handleStep = (label: string) => () => {
    navigate(label);
  };

  return (
    <Container className={clsx('h-100 w-100 p-0')}>
      <Box
        height="100%"
        sx={{ width: '100%' }}
        display="flex"
        flexDirection="column"
        gap="0.3rem">
        <Box
          className={clsx('position-sticky w-100')}
          sx={{
            top: 0,
            zIndex: '999',
          }}>
          <Paper
            className={clsx('w-100')}
            elevation={3}
            sx={{ background: ThemeBlue.background.default }}>
            <Box
              className={clsx(
                'w-100 py-0 px-2 d-flex align-items-center justify-content-between'
              )}
              sx={{ background: ThemeBlue.primary.main }}>
              <Box>
                {!!refPrev.current && (
                  <IconButton
                    size="large"
                    onClick={() => {
                      navigate(refPrev.current);
                    }}>
                    <ChevronLeft sx={{ color: '#fff', fontSize: '1.3rem' }} />
                  </IconButton>
                )}
              </Box>
              <Box>
                <Box
                  className={clsx('text-uppercase fw-bold')}
                  sx={{ color: '#fff', fontSize: '1.3rem' }}>
                  {title}
                </Box>
              </Box>
              <Box>
                <IconButton
                  className={clsx('ml-auto ')}
                  size="large"
                  onClick={() => {
                    navigate('/');
                  }}>
                  <Close sx={{ color: '#fff', fontSize: '1.3rem' }} />
                </IconButton>
              </Box>
            </Box>
          </Paper>
          <Paper
            elevation={3}
            sx={{ background: ThemeBlue.background.default }}>
            <Box
              className={clsx('w-100 d-non')}
              sx={{ background: '#fff' }}
              display="flex"
              flexDirection="column"
              alignItems="start">
              <Box
                className={clsx('w-100 mt-1 px-1 d-flex align-items-center')}
                sx={{ padding: '3px 0', fontSize: '0.8rem' }}>
                <Stepper
                  className={clsx('w-100 px-2')}
                  nonLinear
                  activeStep={steps.indexOf(activeStep as BookingSteps)}>
                  {steps.map((label, index) => (
                    <Step key={`step-${label}`} completed={completed[index]}>
                      <Box
                        className={clsx(
                          'registration-step d-flex flex-column align-items-center'
                        )}>
                        <StepButton
                          className={clsx('p-0 m-0')}
                          sx={{ fontSize: '1.4rem' }}
                          onClick={handleStep(label)}
                        />
                        <div className={clsx('registration-step-label')}>
                          {
                            // @ts-ignore
                            t(`registration.step.short.${label}`)
                          }
                        </div>
                      </Box>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Box className={clsx('w-100 px-2')}>
                <Box
                  onClick={() => {
                    stepNavigation(BookingSteps.TEST_TYPE);
                  }}
                  className={clsx('w-100 mt-1 px-1 d-flex align-items-center')}
                  sx={{ padding: '3px 0', fontSize: '0.8rem' }}>
                  <Box
                    className={clsx(
                      'd-none d-flex- align-items-center justify-content-center me-1'
                    )}>
                    <Circle sx={{ color: testType ? '#008313' : '#e5e5e5' }} />
                    <span
                      className={clsx('position-absolute')}
                      style={{
                        color: testType ? '#fff' : '#000',
                        margin: 'auto',
                      }}>
                      1
                    </span>
                  </Box>
                  <DirectionsWalk sx={{ fontSize: '0.8rem' }} />
                  <Box className={clsx('ms-2')}>
                    {!testType && (
                      <Typography sx={{ fontSize: '0.9rem', color: '#e5e5e5' }}>
                        Leistung
                      </Typography>
                    )}
                    {!!testType && (
                      <Typography
                        className={clsx('fw-bold')}
                        sx={{ fontSize: '0.8rem' }}>
                        {testType.label}
                        {!!testType.price && (
                          <span>:&nbsp;{testType.price} €</span>
                        )}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box
                  className={clsx('w-100 mt-1 px-1 d-flex align-items-center')}
                  onClick={() => {
                    stepNavigation(BookingSteps.SELECT_APPOINTMENT);
                  }}
                  sx={{ padding: '3px 0', fontSize: '0.8rem' }}>
                  <Box
                    className={clsx(
                      'd-none d-flex- align-items-center justify-content-center me-1'
                    )}>
                    <Circle
                      sx={{ color: appointment ? '#008313' : '#e5e5e5' }}
                    />
                    <span
                      className={clsx('position-absolute')}
                      style={{
                        color: appointment ? '#fff' : '#000',
                        margin: 'auto',
                      }}>
                      2
                    </span>
                  </Box>
                  <CalendarTodayRounded sx={{ fontSize: '0.8rem' }} />
                  <Box className={clsx('ms-2')}>
                    {!appointment && (
                      <Typography sx={{ fontSize: '0.9rem', color: '#e5e5e5' }}>
                        Termin
                      </Typography>
                    )}
                    {!!appointment && (
                      <Typography
                        className={clsx('fw-bold')}
                        sx={{ fontSize: '0.8rem' }}>
                        {format(appointment, 'PPPP', { locale: de })}
                        <span>
                          &nbsp; ({format(appointment, 'HH:mm', { locale: de })}{' '}
                          Uhr)
                        </span>
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box
                  className={clsx('w-100 mt-1 px-1 d-flex align-items-center')}
                  onClick={() => {
                    stepNavigation(BookingSteps.ADD_PERSONS);
                  }}
                  sx={{ padding: '3px 0', fontSize: '0.8rem' }}>
                  <Box
                    className={clsx(
                      'd-none d-flex- align-items-center justify-content-center me-1'
                    )}>
                    <Circle
                      sx={{ color: validPersonData ? '#008313' : '#e5e5e5' }}
                    />
                    <span
                      className={clsx('position-absolute')}
                      style={{
                        color: validPersonData ? '#fff' : '#000',
                      }}>
                      3
                    </span>
                  </Box>
                  <Person sx={{ fontSize: '0.8rem' }} />

                  <Box className={clsx(' ms-2 overflow-hidden')} gap="0.8rem">
                    {!persons.length && (
                      <Typography sx={{ fontSize: '0.8rem', color: '#e5e5e5' }}>
                        Teilnehmer
                      </Typography>
                    )}
                    {!!persons.length && (
                      <Typography
                        className={clsx('text-truncate fw-bold')}
                        sx={{ fontSize: '0.8rem' }}>
                        {persons
                          .map(
                            (person, idx) =>
                              `${person.firstName} ${person.secondName}`
                          )
                          .join(', ')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
        <Paper
          elevation={3}
          className={clsx(classes.mainContent)}
          sx={{ background: ThemeBlue.background.default }}>
          <Box className={clsx('w-100 h-100')}>
            <Routes>
              <Route
                path=""
                element={<Navigate to={BookingSteps.TEST_TYPE} />}
              />
              <Route
                path={`:${BookingSteps.TEST_TYPE}`}
                element={
                  <TestTypes
                    onSelect={() => {
                      navigate(BookingSteps.SELECT_APPOINTMENT);
                    }}
                  />
                }
              />
              <Route
                path={`:${BookingSteps.SELECT_APPOINTMENT}`}
                element={
                  <TestAppointment
                    onSelect={() => {
                      navigate(BookingSteps.ADD_PERSONS);
                    }}
                  />
                }
              />
              <Route
                path={`:${BookingSteps.ADD_PERSONS}`}
                element={
                  <DataFormProvider>
                    <TestPersons emitFormValidation={setValidPersonData} />
                  </DataFormProvider>
                }
              />
            </Routes>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
