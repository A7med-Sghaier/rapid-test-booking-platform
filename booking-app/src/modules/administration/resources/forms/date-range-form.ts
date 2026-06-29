import { FormTypeProps } from '../../../../interfaces/form-type-props';
import { Email, LockOutlined } from '@mui/icons-material';

/*************************************************************
 * booking-app - date-range-form.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 12.02.22 - 04:54
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

export const DateRangeForm: FormTypeProps = {
  type: 'form',
  key: 'date-range-form',
  indicators: ['required'],
  cssClasses: 'd-flex flex-wrap',
  style: {},
  fields: [
    {
      elementType: 'dateRangePicker',
      key: 'date-range',
      style: { width: '90%' },
      cssClasses: 'offset-1 offset-md-3 col-10 col-md-6 mb-5 ',
      required: true,
      startAdornment: Email,
    },
  ],
};
