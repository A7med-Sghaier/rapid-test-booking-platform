import { FormTypeProps } from '../../interfaces/form-type-props';

/*************************************************************
 * booking-app - cwa-forms.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 14.02.22 - 22:10
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

export const ResultEligibleFrom: FormTypeProps = {
  type: 'form',
  key: 'result-eligible-form',
  indicators: ['required'],
  cssClasses: 'd-flex flex-wrap',
  style: {},
  fields: [
    {
      elementType: 'date',
      type: 'date',
      key: 'testDate',
      style: { width: '100%' },
      cssClasses: 'col-12 ',
      required: true,
    },
  ],
};
export const CwaAgreementFrom: FormTypeProps = {
  type: 'form',
  key: 'result-eligible-form',
  indicators: ['required'],
  cssClasses: 'd-flex flex-wrap px-0',
  style: {},
  fields: [
    {
      elementType: 'dropdown',
      labelTranslationKey: 'cwa',
      type: 'text',
      key: 'agreement',
      style: { width: '100%' },
      cssClasses: 'col-12',
      required: true,
      items: {
        type: 'notGroupedOptions',
        options: [
          //  { value: 'noTransmission', key: 'noTransmission' },
          { value: 'transmissionAnonym', key: 'transmissionAnonym' },
          { value: 'transmissionOfData', key: 'transmissionOfData' },
        ],
      },
    },
  ],
};
