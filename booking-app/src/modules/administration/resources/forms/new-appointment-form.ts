import { FormTypeProps } from '../../../../interfaces/form-type-props';
import { getGroupedCountries } from '../../../../utils/countries-util';

/*************************************************************
 * booking-app - new-appointment-form.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 06.02.22 - 20:53
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
export const NewAppointmentForm: FormTypeProps = {
  type: 'form',
  key: 'registration-form',
  indicators: ['required'],
  cssClasses: 'd-flex flex-wrap',
  style: {
    // display: 'grid',
    // gridTemplateAreas: `'. col-1 . col-2 .' '. . . col-3 .'`,
    // gap: '2rem',
    // gridTemplateColumns: '1fr 6fr 1fr 6fr 1fr',
  },
  fields: [
    {
      elementType: 'dropdown',
      type: 'text',
      key: 'testType',
      style: { width: '90%' },
      cssClasses:
        'offset-1 offset-md-0 col-10 col-md-6 pe-md-2 mb-3 mb-md-4 me-2',
      required: true,
      items: {
        type: 'testTypes',
        options: [],
      },
    },
    {
      elementType: 'input',
      type: 'text',
      key: 'firstName',
      style: { width: '90%', gridArea: '1 / col-1' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6 pe-md-2 mb-3 mb-md-4',
      required: true,
    },
    {
      elementType: 'input',
      type: 'text',
      key: 'secondName',
      style: { width: '90%', gridArea: '1 / col-2' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  ps-md-2 mb-3 mb-md-4',
      required: true,
    },
    {
      elementType: 'date',
      type: 'date',
      key: 'birthDate',
      style: { width: '90%', gridArea: '2 / col-1' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  pe-md-2 mb-3 mb-md-4',
      required: true,
    },

    {
      elementType: 'input',
      type: 'text',
      key: 'cin',
      style: { width: '90%' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6 pe-md-2 mb-3 mb-md-4',
      optional: true,
    },
    {
      elementType: 'input',
      type: 'email',
      key: 'email',
      style: { width: '90%', gridArea: '2 / col-2' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  ps-md-2 mb-3 mb-md-4',
      required: true,
    },
    {
      elementType: 'input',
      type: 'email',
      key: 'email_repeat',
      required: true,
      style: { width: '90%', gridArea: '3 / col-2' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  pe-md-2 mb-3 mb-md-4',
      validator: (formValues) =>
        !!formValues.email_repeat &&
        formValues.email !== formValues.email_repeat
          ? 'email_not_matched'
          : undefined,
    },
    {
      elementType: 'input',
      type: 'number',
      key: 'telephone',
      style: { width: '90%', gridArea: '4 / col-1' },
      cssClasses:
        'offset-1 offset-md-0 col-10 col-md-6 me-2 pe-md-2 mb-3 mb-md-4',
      required: true,
    },
    {
      elementType: 'input',
      type: 'text',
      key: 'address',
      style: { width: '90%', gridArea: '5 / col-1' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  pe-md-2 mb-3 mb-md-4',

      required: true,
    },
    {
      elementType: 'input',
      type: 'number',
      key: 'postalCode',
      style: { width: '90%', gridArea: '6 / col-1' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  ps-md-2 mb-3 mb-md-4',
      required: true,
    },
    {
      elementType: 'input',
      type: 'text',
      key: 'city',
      style: { width: '90%', gridArea: '5 / col-2' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  pe-md-2 mb-3 mb-md-4',
      required: true,
    },
    {
      elementType: 'dropdown',
      type: 'text',
      key: 'country',
      style: { width: '90%', gridArea: '4 / col-2' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  ps-md-2 mb-3 mb-md-4',
      required: true,
      defaultValue: 'deu',
      items: {
        type: 'groupedCountries',
        groups: getGroupedCountries,
      },
    },
  ],
};
