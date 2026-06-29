/*************************************************************
 * booking-app - login-page.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 26.01.22 - 19:31
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { YetaHeader } from '../../../components/yeta/yeta-header';
import clsx from 'clsx';
import { GlobalAppContext } from '../../../contexts/global-app-context';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Form } from '../../../components/forms/form';
import { LoginForm } from '../resources/forms/login-form';
import { DataFormContext } from '../../../contexts/forms/data-form-context';
import {
  AuthContext,
  LoginParamsProps,
} from '../../../contexts/auth/auth-context';
import { ThemeBlue } from '../../../themes/theme-blue';
import { LoginBtn } from '../../../components/buttons/login-btn';

export const LoginPage: React.FC = ({ children }) => {
  const { t } = useTranslation();
  const [userData, setUserData] = useState();
  const { login } = useContext(AuthContext);
  const { center } = useContext(GlobalAppContext);
  const { formValues, checkFormValidation } = useContext(DataFormContext);
  const { first_login, data: loginData } = useParams();
  const handleLoginEvt = () => {
    login(formValues as LoginParamsProps);
  };

  useEffect(() => {
    if (first_login === 'first-login' && !!loginData) {
      setUserData(JSON.parse(decodeURI(atob(loginData))));
    }
  }, [loginData]);

  return (
    <Container
      maxWidth={false}
      className={clsx('login-page h-100 pt-5 d-flex flex-column')}
      sx={{ background: ThemeBlue.primary.main }}>
      <YetaHeader />
      <Box
        className={clsx('flex-grow-1 d-flex flex-column')}
        sx={{
          color: '#61676a',
          fontSize: '0.9rem',
        }}>
        <Box
          className={clsx('w-100 fw-bolder text-center text-white mt-5')}
          sx={{ fontSize: '1.4rem' }}>
          {center?.name}
        </Box>
        <Box
          className={clsx(
            'flex-grow-1 d-flex flex-column justify-content-center'
          )}>
          <Box className={clsx('mt-4 text-white')}>
            {t('admin.giveYourCredentials')}
          </Box>
          <Box className={clsx('mt-4 text-white opacity-100')}>
            <Form form={LoginForm} defaultValues={userData} />
          </Box>
          <Box
            className={clsx(' offset-1 offset-md-3 col-10 col-md-6 mb-5 p-2')}>
            <Box className={clsx('w-90 p-4')}>
              <LoginBtn
                onClick={handleLoginEvt}
                disabled={!checkFormValidation()}
                variant="contained"
                fullWidth>
                {t('form.login')}
              </LoginBtn>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
