/*************************************************************
 * booking-app - booking-done.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 22.01.22 - 11:14
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Checkbox,
  Container,
  FormControlLabel,
  Paper,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { ThemeBlue } from '../../../themes/theme-blue';
import { GlobalAppContext } from '../../../contexts/global-app-context';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PersonProps } from '../contexts/appointment/booking-context';
import { ColorButton } from '../../../components/buttons/buttons';
import { BookingProps } from '../../../interfaces/booking-interface';
import { cancelAppointment } from '../../administration/utils/appointment-utils';

export const BookingCancel: React.FC = ({ children }) => {
  const { t } = useTranslation();
  const { center } = useContext(GlobalAppContext);
  const navigate = useNavigate();
  const { bookingData } = useParams();
  const [booking, setBooking] = useState<BookingProps>();
  const [firstPerson, setFirstPerson] = useState<PersonProps>();
  const [persons, setPersons] = useState<PersonProps[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [cancelPerformed, setCancelPerformed] = useState<boolean>(false);

  const goToHomePage = () => {
    navigate('/');
  };

  const areAllChecked = useCallback((): boolean => {
    return checked.length === persons.length;
  }, [checked]);

  const handleCheckAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setChecked([...persons.map((person) => person.uid as string)]);
    } else {
      setChecked([]);
    }
  };

  const handleCheckOne = (isChecked: boolean, uid: string) => {
    if (isChecked) {
      setChecked([...checked, uid]);
    } else {
      const indIdx = checked.findIndex((item) => item === uid);
      if (indIdx >= 0) {
        delete checked[indIdx];
        setChecked([...checked]);
      }
    }
  };

  const handleCancel = () => {
    if (booking && booking.appointmentUid) {
      cancelAppointment(booking.appointmentUid, checked, 'user').then(
        (result) => {
          if (result.matchedCount && result.modifiedCount) {
            setCancelPerformed(true);
          }
        }
      );
    }
  };

  useEffect(() => {
    if (booking) {
      setPersons([...booking.persons]);
    }
  }, [booking]);

  useEffect(() => {
    if (persons.length && !!persons[0]) {
      setFirstPerson(persons[0]);
      setChecked(
        persons.reduce((checks: string[], person) => {
          if (person.canceled === true) {
            checks.push(person.uid as string);
          }
          return checks;
        }, [])
      );
    }
  }, [persons]);

  useEffect(() => {
    if (!booking && bookingData) {
      setBooking(JSON.parse(decodeURI(atob(bookingData))));
    }
  }, []);

  return (
    <Container className={clsx('h-100 w-100 p-0 d-flex flex-column')}>
      <Paper
        className={clsx('w-100')}
        elevation={3}
        sx={{ backgroundColor: ThemeBlue.background.default }}>
        <Box
          className={clsx(
            'w-100 py-2 px-2 d-flex align-items-center justify-content-between'
          )}
          sx={{ background: ThemeBlue.primary.main }}>
          <Box className={clsx('w-100 d-flex flex-column ps-1 ps-md-4 py-1')}>
            <Typography
              className={clsx('fw-bolder text-white')}
              sx={{ fontSize: '1.2rem' }}>
              {center?.name}
            </Typography>
            <Box className={clsx('w-100 d-flex justify-content-center')}>
              <Typography
                className={clsx('fw-bold text-muted')}
                sx={{ fontSize: '0.8rem' }}>
                {`${center?.address}${
                  (center?.city || center?.postalCode) && ','
                }`}
              </Typography>
              <span>&nbsp;</span>
              <Typography
                className={clsx('fw-bold text-muted')}
                sx={{ fontSize: '0.8rem' }}>
                {center?.postalCode} {center?.city}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box
        className={clsx(
          'w-100 px-2 py-3 d-flex flex-column flex-grow-1 justify-content-center align-items-center'
        )}
        sx={{ backgroundColor: `${ThemeBlue.background.default} !important` }}
        gap="0.3rem">
        <Paper className={clsx('w-100 h-100 my-3 pt-4')} elevation={2}>
          <Box className={clsx(' px-4 w-100 h-100 d-flex flex-column')}>
            <Typography
              className={clsx(
                'text-start fw-bold align-items-start text-uppercase'
              )}
              sx={{ fontSize: '0.8rem' }}>
              {t('bookingCancel.cancel')}
            </Typography>
            <Box className={clsx('d-flex flex-column  mt-3')}></Box>
            <Paper
              elevation={3}
              className={clsx('d-flex flex-column p-2 pt-3 mt-3')}
              sx={{
                backgroundColor: `${ThemeBlue.background.default} !important`,
              }}>
              {!cancelPerformed && (
                <Box className={clsx('d-flex flex-column')}>
                  <Typography
                    className={clsx(
                      ' text-start mt-2 fw-bold align-items-start text-uppercase'
                    )}
                    sx={{ fontSize: '0.8rem' }}>
                    {t('bookingCancel.whoShouldBeCanceled')}
                  </Typography>
                  <Box className={clsx('d-flex flex-column  mt-3')}>
                    <FormControlLabel
                      label={t('bookingCancel.all')}
                      control={
                        <Checkbox
                          disabled={cancelPerformed}
                          checked={areAllChecked()}
                          indeterminate={!areAllChecked()}
                          onChange={handleCheckAll}
                        />
                      }
                    />
                    {booking && booking.persons && booking.persons.length && (
                      <Box className={clsx('d-flex flex-column ms-4')}>
                        {booking.persons.map((person) => (
                          <FormControlLabel
                            key={`cancel-person-${person.uid}`}
                            label={`${person.firstName} ${person.secondName}`}
                            control={
                              <Checkbox
                                disabled={cancelPerformed}
                                checked={checked.includes(person.uid as string)}
                                onChange={(evt) => {
                                  handleCheckOne(
                                    evt.target.checked,
                                    person.uid as string
                                  );
                                }}
                              />
                            }
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                  <ColorButton
                    className={clsx('mt-4 mb-2')}
                    sx={{ borderRadius: '0' }}
                    fullWidth
                    onClick={handleCancel}
                    variant="contained">
                    {t('bookingCancel.cancelBt')}
                  </ColorButton>
                </Box>
              )}
              {cancelPerformed && (
                <Box className={clsx('d-flex flex-column align-items-center')}>
                  <Typography
                    className={clsx(
                      ' text-start mt-2 fw-bold align-items-start text-uppercase'
                    )}
                    sx={{ fontSize: '0.8rem' }}>
                    {t('bookingCancel.canceled')}
                  </Typography>
                  <Typography
                    className={clsx(
                      'text-start mt-3 fw-bold- align-items-start '
                    )}
                    sx={{ fontSize: '0.75rem' }}>
                    {t('bookingCancel.messageInfo', {
                      email: firstPerson?.email,
                    })}
                  </Typography>
                  <ColorButton
                    className={clsx('mt-4 mb-2')}
                    sx={{ borderRadius: '0' }}
                    fullWidth
                    onClick={goToHomePage}
                    variant="contained">
                    {t('global.goToWebsite')}
                  </ColorButton>
                </Box>
              )}
            </Paper>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

/**
 * background-position: center;
 *     background-size: contain;
 *     height: 7rem;
 *     background-repeat: no-repeat;
 */
