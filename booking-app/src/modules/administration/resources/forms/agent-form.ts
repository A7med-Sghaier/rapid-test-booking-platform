import { getGroupedCountries } from '../../../../utils/countries-util';
import { FormTypeProps } from '../../../../interfaces/form-type-props';

/*************************************************************
 * booking-app - agent-form.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 04.02.22 - 16:42
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
export const AgentForm: FormTypeProps = {
  type: 'form',
  key: 'agent-form',
  indicators: ['required'],
  cssClasses: 'd-flex flex-wrap',
  style: {},
  fields: [
    {
      elementType: 'input',
      type: 'text',
      key: 'userName',
      style: { width: '90%', gridArea: '1 / col-1' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6 pe-md-2 mb-3 mb-md-4',
      required: true,
    },
    {
      elementType: 'input',
      type: 'email',
      key: 'email',
      required: true,
      style: { width: '90%', gridArea: '3 / col-2' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  pe-md-2 mb-3 mb-md-4',
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
      type: 'number',
      key: 'telephone',
      style: { width: '90%', gridArea: '4 / col-1' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  pe-md-2 mb-3 mb-md-4',
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
