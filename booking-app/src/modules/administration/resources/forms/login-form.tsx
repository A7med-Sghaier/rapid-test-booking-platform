/*************************************************************
 * booking-app_ - login-form.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 14.01.22 - 16:33
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

import { FormTypeProps } from '../../../../interfaces/form-type-props';
import { getGroupedCountries } from '../../../../utils/countries-util';
import { isValid } from 'date-fns';
import { Email, LockOutlined } from '@mui/icons-material';

export const LoginForm: FormTypeProps = {
  type: 'form',
  key: 'login-form',
  indicators: ['required'],
  cssClasses: 'd-flex flex-wrap',
  style: {},
  fields: [
    {
      elementType: 'input',
      type: 'text',
      key: 'userName',
      style: { width: '90%' },
      cssClasses: 'offset-1 offset-md-3 col-10 col-md-6 mb-5 ',
      required: true,
      startAdornment: Email,
    },
    {
      elementType: 'input',
      type: 'password',
      key: 'password',
      style: { width: '90%' },
      cssClasses: 'offset-1 offset-md-3 col-10 col-md-6 mb-3 ',
      required: true,
      startAdornment: LockOutlined,
    },
  ],
};
