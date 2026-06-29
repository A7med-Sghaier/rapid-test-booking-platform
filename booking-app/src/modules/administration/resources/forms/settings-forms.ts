import { getGroupedCountries } from '../../../../utils/countries-util';
import { compareAsc } from 'date-fns';
import { Delete, PhotoCamera } from '@mui/icons-material';

/*************************************************************
 * booking-app - settings-forms.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 30.01.22 - 12:53
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

export const BaseDataForm = {
  type: 'form',
  key: 'settings-base-form',
  indicators: ['required'],
  cssClasses: 'd-flex flex-wrap justify-content-start',
  style: { maxWidth: 'unset !important' },
  fields: [
    {
      elementType: 'upload',
      key: 'logo',
      accept: 'image/(.jpeg,.jpg,.png,.gif)',
      style: { width: '90%' },
      cssClasses: 'offset-1 col-10  mb-1  pe-md-2',
      required: true,
      IconButton: PhotoCamera,
      showImage: true,
      logoViewStyle: { width: '10rem', height: '10rem' },
    },
    {
      elementType: 'input',
      type: 'text',
      key: 'name',
      style: { width: '90%' },
      cssClasses:
        'offset-1 offset-md-0 col-10 col-md-6 me-1 pe-md-2 mb-3 mb-md-4',
      required: true,
    },
    {
      elementType: 'input',
      type: 'text',
      key: 'address',
      style: { width: '90%' },
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

export const HealthOfficeDataForm = {
  type: 'form',
  key: 'health-office-form',
  indicators: ['required'],
  cssClasses: 'd-flex flex-wrap justify-content-start',
  style: { maxWidth: 'unset !important' },
  fields: [
    {
      elementType: 'input',
      type: 'text',
      key: 'healthOfficeEmail',
      style: { width: '90%' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  mb-5  me-1 pe-md-2',
      required: true,
    },
  ],
};

export const TestTypesDataForm = {
  type: 'form',
  key: 'test-types-form',
  indicators: ['required'],
  cssClasses: 'd-flex flex-wrap justify-content-start',
  style: { maxWidth: 'unset !important' },
  fields: [
    {
      elementType: 'extendable-table',
      type: 'string',
      key: 'testTypes',
      style: { width: '90%' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6 mb-5 me-1 pe-md-2',
      controlAddForm: {
        type: 'form',
        key: 'add-section-form',
        indicators: ['required'],
        cssClasses: 'd-flex flex-wrap justify-content-start p-0',
        style: { maxWidth: 'unset !important' },
        fields: [
          {
            elementType: 'input',
            type: 'text',
            key: 'label',
            style: { width: '90%' },
            cssClasses: 'col-6 mb-2  pe-md-2',
            required: true,
          },
          {
            elementType: 'input',
            type: 'number',
            key: 'price',
            style: { width: '90%' },
            cssClasses: 'col-6 ps-md-2 mb-2 mb-md-4',
            required: true,
          },
        ],
      },
      rowGroup: {
        key: 'test-types-group',
        type: 'group',
        rowAction: {
          IconBtn: Delete,
          action: (
            formValues: any,
            idx: number,
            callback: (vals: any) => void
          ) => {
            if (formValues.testTypes) {
              const newValues = [...formValues.testTypes].filter(
                (item, filterIdx) => filterIdx !== idx
              );
              callback(newValues);
            }
          },
        },
        cells: [
          {
            type: 'control',
            elementType: 'checkbox',
            key: 'isActive',
            label: '',
            cssClasses: 'col-1 me-2 mt-1 time-settings-checkbox ',
          },
          {
            type: 'text',
            elementType: 'text',
            key: 'label',
            cssClasses: 'me-2 mt-1',
          },
          {
            type: 'text',
            elementType: 'text',
            key: 'price',
            cssClasses: 'me-2 mt-1 ',
          },
        ],
      },
    },
  ],
};

export const OpeningTimesDataForm = {
  type: 'form',
  key: 'settings-opening-times-form',
  indicators: ['required'],
  cssClasses: 'd-flex flex-wrap justify-content-start',
  style: { maxWidth: 'unset !important' },
  fields: [
    {
      elementType: 'repeated-composed-group',
      key: 'openingTimes',
      style: { width: '90%' },
      cssClasses: 'col-12 d-flex',
      repeatedGroup: {
        groupKeys: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
        cssClasses: 'col-12 d-flex align-items-center mb-4',
        fields: [
          {
            elementType: 'checkbox',
            key: 'isOpen',
            labelTranslationKey: 'day.{{groupKey}}',
            cssClasses: 'col-2 mt-1 time-settings-checkbox text-start',
            validator: (options: any) => {
              if (!options.formValues) return undefined;
              const openingTimes = options.formValues.openingTimes;
              return !!openingTimes &&
                !!openingTimes[options.groupKey] &&
                !!openingTimes[options.groupKey].isOpen &&
                !openingTimes[options.groupKey].to &&
                !openingTimes[options.groupKey].to
                ? 'required_time_range'
                : undefined;
            },
          },
          {
            elementType: 'timeInput',
            key: 'from',
            label: 'time-from',
            cssClasses: 'mx-4 ',
            disabled: (options: any) => {
              if (!options.formValues) return false;
              const openingTimes = options.formValues.openingTimes;
              return (
                !openingTimes ||
                !openingTimes[options.groupKey] ||
                !openingTimes[options.groupKey].isOpen
              );
            },
            validator: (options: any) => {
              if (!options.formValues) return undefined;
              const openingTimes = options.formValues.openingTimes;
              return !!openingTimes &&
                !!openingTimes[options.groupKey] &&
                !!openingTimes[options.groupKey].from &&
                !openingTimes[options.groupKey].from.match(/^\d{2}:\d{2}$/)
                ? 'invalid_time_format'
                : undefined;
            },
          },
          {
            elementType: 'timeInput',
            key: 'to',
            label: 'time-to',
            cssClasses: 'mx-4 ',
            disabled: (options: any) => {
              if (!options.formValues) return false;
              const openingTimes = options.formValues.openingTimes;

              if (openingTimes) {
                const timeFrom = openingTimes[options.groupKey]?.from;
                const timeTo = openingTimes[options.groupKey]?.to;
                if (
                  !openingTimes[options.groupKey]?.isOpen ||
                  !timeFrom ||
                  (timeFrom && !timeFrom.match(/^\d{2}:\d{2}$/))
                ) {
                  return true;
                }
              }
            },
            validator: (options: any) => {
              if (!options.formValues) return undefined;
              const openingTimes = options.formValues.openingTimes;
              if (openingTimes) {
                if (openingTimes[options.groupKey]) {
                  const timeTo = openingTimes[options.groupKey].to as string;

                  if (timeTo && !timeTo.match(/^\d{2}:\d{2}$/)) {
                    return 'invalid_time_format';
                  } else {
                    const timeFrom = openingTimes[options.groupKey]
                      .from as string;
                    if (timeFrom && timeTo) {
                      const fromParts = timeFrom.split(':');
                      const toParts = timeTo.split(':');
                      if (
                        parseInt(fromParts[0]) > parseInt(toParts[0]) ||
                        (parseInt(fromParts[0]) === parseInt(toParts[0]) &&
                          parseInt(fromParts[1]) > parseInt(toParts[1]))
                      ) {
                        return 'time_to_should_be_not_earlier_than_time_from';
                      }
                    }
                  }
                }
              }
              return undefined;
            },
          },
        ],
      },
    },
  ],
};

export const TimeSlotsDataForm = {
  type: 'form',
  key: 'settings-time-slots-form',
  indicators: ['required'],
  cssClasses: 'd-flex flex-wrap justify-content-start',
  style: { maxWidth: 'unset !important' },
  fields: [
    {
      elementType: 'input',
      type: 'number',
      key: 'maxPerSlot',
      style: { width: '90%' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  mb-5  me-1 pe-md-2',
      required: true,
    },
  ],
};

export const TestKitsDataForm = {
  type: 'form',
  key: 'test-kits-form',
  indicators: ['required'],
  cssClasses: 'd-flex flex-wrap justify-content-start',
  style: { maxWidth: 'unset !important' },
  fields: [
    {
      elementType: 'extendable-table',
      type: 'string',
      key: 'testKits',
      style: { width: '90%' },
      cssClasses: 'offset-1 offset-md-0 col-10 col-md-6  mb-5  me-1 pe-md-2',
      controlAddForm: {
        type: 'form',
        key: 'add-section-form',
        indicators: ['required'],
        cssClasses: 'd-flex flex-wrap p-0 justify-content-start',
        style: { maxWidth: 'unset !important' },
        fields: [
          {
            elementType: 'input',
            type: 'text',
            key: 'label',
            style: { width: '90%' },
            cssClasses: 'col-11 mb-2 ',
            required: true,
          },
        ],
      },
      rowGroup: {
        key: 'kits-group',
        type: 'radioGroup',
        rowAction: {
          IconBtn: Delete,
          action: (
            formValues: any,
            idx: number,
            callback: (vals: any) => void
          ) => {
            if (formValues.testKits) {
              const newValues = [...formValues.testKits].filter(
                (item, filterIdx) => filterIdx !== idx
              );
              callback(newValues);
            }
          },
        },
        cells: [
          {
            type: 'control',
            elementType: 'radio',
            valueKey: 'label',
            radioGroupName: 'isActive',
            key: 'isActive',
            label: '',
            cssClasses: 'col-1 me-2 mt-1',
          },
          {
            type: 'text',
            elementType: 'text',
            key: 'label',
            cssClasses: 'me-3 mt-1',
          },
        ],
      },
    },
  ],
};
