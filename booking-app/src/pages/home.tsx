/*************************************************************
 * booking-app - home.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 17.01.22 - 15:08
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useState } from 'react';
import {
  Box,
  Container,
  FormControl,
  IconButton,
  Input,
  InputLabel,
  Paper,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { ThemeBlue } from '../themes/theme-blue';
import { useTranslation } from 'react-i18next';
import { ColorButton } from '../components/buttons/buttons';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Close } from '@mui/icons-material';
import { GlobalAppContext } from '../contexts/global-app-context';
import { ReqDataPerEmail } from '../utils/global/req-data-utils';
import { YetaHeader } from '../components/yeta/yeta-header';

export const Home: React.FC = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reqEmail, setReqEmail] = useState<string>();
  const { center } = useContext(GlobalAppContext);

  const requestPersonDataByEmail = () => {
    if (reqEmail) {
      ReqDataPerEmail(reqEmail).then((result) => {
        console.log(result);
      });
    }
  };

  return (
    <Container className={clsx('h-100 w-100 p-2 pt-5 d-flex flex-column')}>
      <YetaHeader color="#A4A6B3" />
      <Box className={clsx('mt-5')}>
        <Typography className={clsx('fw-bolder')} sx={{ fontSize: '1.4rem' }}>
          {center?.name}
        </Typography>
      </Box>
      <Box
        className={clsx(
          'w-100 d-flex flex-column flex-grow-1 justify-content-center align-items-center '
        )}
        sx={{
          color: '#61676a',
          fontSize: '0.8rem',
        }}
        gap="0.3rem">
        <Box className={clsx('text-uppercase fw-bold mb-3')} sx={{}}>
          {t('global.newRegistration')}
        </Box>
        <Box className={clsx('w-100 mb-3')}>
          <Box className={clsx('mb-4')}>
            <div>{t('global.firstTime')} ?</div>{' '}
            <div>{t('global.pleaseRegister')}</div>
          </Box>
          <ColorButton
            className={clsx('rounded w-100 py-2 fw-bold')}
            onClick={() => {
              navigate('reservation');
            }}
            sx={{ fontSize: '0.8rem' }}>
            {t('global.toRegistration')}
          </ColorButton>
        </Box>
        <Box className={clsx('text-uppercase fw-bold mt-4 mb-2')} sx={{}}>
          {t('global.reebooking')}
        </Box>
        <Box className={clsx('w-100 mb-3')}>
          <Box>{t('global.haveBeenWithBefore')} ?</Box>
          <Box>{t('global.youWillGetRegistrationLink')}:</Box>
          <Box className={clsx('mb-4 px-2')}>
            <FormControl variant="standard" className={clsx('w-100')}>
              <InputLabel
                className={clsx(' fw-bold ')}
                htmlFor="get-link-per-mail"
                sx={{ color: 'rgba(199,199,199,0.8)', fontSize: '1rem' }}>
                {t(`form.email`)}
              </InputLabel>
              <Input
                id="get-link-per-mail"
                onChange={(evt) => {
                  setReqEmail(evt.target.value);
                }}
              />
            </FormControl>
          </Box>
          <ColorButton
            onClick={requestPersonDataByEmail}
            className={clsx('rounded w-100 py-2 fw-bold')}
            sx={{ fontSize: '0.8rem' }}>
            {t('global.sendUrl')}
          </ColorButton>
        </Box>
      </Box>
    </Container>
  );
};
