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
import { APPOINTMENT_STATUS } from '../../../test_reservation/contexts/appointment/booking-context';

export const TodayFilterForm: FormTypeProps = {
  type: 'form',
  key: 'today-filter-form',
  indicators: ['required'],
  cssClasses: 'd-flex flex-wrap px-4',
  style: { maxWidth: 'unset !important' },
  fields: [
    {
      elementType: 'input',
      type: 'text',
      key: 'today-search-all-field',
      style: { width: '100%' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  ps-md-2 mb-3 mb-md-4 ',
    },
    {
      elementType: 'dropdown',
      type: 'text',
      key: 'test-results',
      style: { width: '90%', gridArea: '4 / col-2' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  ps-md-2 mb-3 mb-md-4',
      defaultValue: '',
      items: {
        type: 'notGroupedOptions',
        options: [
          { key: 'positive', value: 'positive' },
          { key: 'negative', value: 'negative' },
          { key: 'invalid', value: 'invalid' },
        ],
      },
      excludeOn: (options: any) => {
        if (options && options.appointmentType) {
          return options.appointmentType !== APPOINTMENT_STATUS.TEST_PERFORMED;
        }
        return true;
      },
    },
  ],
};
