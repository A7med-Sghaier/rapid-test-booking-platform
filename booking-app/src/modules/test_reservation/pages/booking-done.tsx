/*************************************************************
 * booking-app - booking-done.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 22.01.22 - 11:14
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import clsx from 'clsx';
import { ThemeBlue } from '../../../themes/theme-blue';
import { GlobalAppContext } from '../../../contexts/global-app-context';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { PersonProps } from '../contexts/appointment/booking-context';
import { ColorButton } from '../../../components/buttons/buttons';

export const BookingDone: React.FC = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { center } = useContext(GlobalAppContext);
  const { state } = useLocation();
  const person = useRef<PersonProps>();
  const [qrCode, setQrCode] = useState(null);

  const goToHomePage = () => {
    navigate('/');
  };

  useEffect(() => {
    if (person.current === undefined && !!state) {
      const persons: PersonProps[] = [...(state as any).persons] || [];
      if (persons.length && !!persons[0]) {
        person.current = persons[0];
      }
    }
    if (qrCode === null && !!state) {
      if (!!(state as any).qr && typeof (state as any).qr === 'string') {
        setQrCode((state as any).qr);
      }
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
            <Box
              className={clsx(
                'w-100 d-flex justify-content-center text-light opacity-75'
              )}>
              <Typography
                className={clsx('fw-bold ')}
                sx={{ fontSize: '0.8rem' }}>
                {`${center?.address}${
                  (center?.city || center?.postalCode) && ','
                }`}
              </Typography>
              <span>&nbsp;</span>
              <Typography
                className={clsx('fw-bold')}
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
              {t('bookingDone.manyThank')}
            </Typography>
            <Typography
              className={clsx(
                ' text-start mt-2 fw-bold align-items-start text-uppercase'
              )}
              sx={{ fontSize: '0.8rem' }}>
              {t('bookingDone.weReceivedYourBookingOnName', {
                name: `${person.current?.firstName}, ${person.current?.secondName}`,
              })}
            </Typography>
            <Typography
              className={clsx('text-start mt-3 fw-bold- align-items-start ')}
              sx={{ fontSize: '0.75rem' }}>
              {t('bookingDone.messageInfo', {
                email: person.current?.email,
              })}
            </Typography>
            <Box className={clsx('d-flex flex-column  mt-3')}></Box>
            <Paper
              elevation={3}
              className={clsx('d-flex flex-column p-2 pt-3 mt-3')}
              sx={{
                backgroundColor: `${ThemeBlue.background.default} !important`,
              }}>
              <Typography
                className={clsx(
                  'text-start fw-bold align-items-start text-uppercase'
                )}
                sx={{ fontSize: '0.8rem' }}>
                {t('global.pleaseNote')}
              </Typography>
              <Typography
                className={clsx('text-start mt-3 fw-bold- align-items-start ')}
                sx={{ fontSize: '0.75rem' }}>
                {t('bookingDone.noticeInfo')}
              </Typography>
              <Typography
                className={clsx('text-start mt-3 fw-bold- align-items-start ')}
                sx={{ fontSize: '0.75rem' }}>
                {t('bookingDone.noticeThank')}
              </Typography>
              <Box
                className={clsx('mt-4 ')}
                sx={{
                  backgroundImage: `url(${qrCode})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  height: '10rem',
                }}
              />
              <ColorButton
                className={clsx('mt-4 mb-2')}
                sx={{ borderRadius: '0' }}
                fullWidth
                onClick={goToHomePage}
                variant="contained">
                {t('global.goToWebsite')}
              </ColorButton>
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
