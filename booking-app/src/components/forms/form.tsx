/*************************************************************
 * booking-app - form.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 14.01.22 - 22:50
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React from 'react';
import { Container } from '@mui/material';
import { FormElementTypeProps } from '../../interfaces/form-element-type-props';
import { FormElement } from './form-element';
import clsx from 'clsx';

interface FormProps {
  form: any;
  defaultValues?: { [key: string]: any };
  excludeOptions?: { [key: string]: any };
}

export const Form: React.FC<FormProps> = ({
  form,
  defaultValues,
  excludeOptions,
}) => {
  const formStyle = form.style || {};

  return (
    <Container sx={formStyle} className={clsx(form.cssClasses)}>
      {form.fields
        .filter((field: FormElementTypeProps) => {
          if (field.excludeOn && excludeOptions) {
            return !field.excludeOn(excludeOptions);
          }
          return true;
        })
        .map((element: FormElementTypeProps) => {
          let elementValue = undefined;
          if (defaultValues) {
            elementValue = defaultValues[element.key];
          }
          return (
            <FormElement
              key={`element-${element.key}`}
              formKey={form.key}
              element={element}
              value={elementValue}
            />
          );
        })}
    </Container>
  );
};
