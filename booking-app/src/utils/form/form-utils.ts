/*************************************************************
 * booking-app - form-utils.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 16.01.22 - 18:07
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { FormTypeProps } from '../../interfaces/form-type-props';

export interface FormDataProps {
  values: any;
  validators: any[];
}
export const initFormData = (formTemplate: FormTypeProps): FormDataProps => {
  return formTemplate.fields.reduce(
    (data: FormDataProps, field) => {
      const values = { ...data.values, [field.key]: null };
      const validators = [...data.validators, field.validator];
      if (field.required) {
        validators.push((formValues: any) =>
          !!formValues[field.key] && true ? undefined : 'required'
        );
      }
      return { values, validators };
    },
    { values: {}, validators: [] }
  );
};
