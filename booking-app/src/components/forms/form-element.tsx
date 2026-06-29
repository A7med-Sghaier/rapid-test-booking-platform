/*************************************************************
 * booking-app - form-element.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 14.01.22 - 22:50
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FormElementTypeProps } from '../../interfaces/form-element-type-props';
import { InputText } from './elements/input-text';
import { InputDate } from './elements/input-date';
import { DropDownElement } from './elements/drop-down-element';
import { DataFormContext } from '../../contexts/forms/data-form-context';
import { debounce } from '@mui/material';
import { RepeatedComposedGroup } from './elements/repeated-composed-group';
import { CheckboxElement } from './elements/checkbox-element';
import { ExtendableTable } from './elements/extendable-table';
import { InputTimeElement } from './elements/input-time-element';
import { SingleUploadElement } from './elements/single-upload-element';
import { RadioElement } from './elements/radio-element';

export interface FormElementProps {
  element: FormElementTypeProps;
  formKey: string;
  value?: any;
  groupKey?: string;
  isDeepElement?: boolean;
  onDeepChange?: (key: string, value: any) => void;
  reset?: () => void;
  radioGroupName?: string;
  radioVal?: any;
}
export const FormElement: React.FC<FormElementProps> = ({
  formKey,
  element,
  value,
  groupKey,
  isDeepElement,
  onDeepChange,
  radioGroupName,
  radioVal,
}) => {
  const { initialising, formValues, setFormValue, setValidField } =
    useContext(DataFormContext);

  useEffect(() => {
    let validation = false;
    if (
      (!!element.required && !!formValues[element.key]) ||
      !element.required
    ) {
      validation =
        !element.validator || element.validator(formValues) === undefined;
    }
    setValidField(element.key, validation);
  }, [formValues]);

  useEffect(() => {
    if (!isDeepElement && !initialising && !!value) {
      setFormValue(element.key, value);
    }
  }, [initialising]);

  switch (element.elementType) {
    case 'input':
      return React.useMemo(
        () => (
          <InputText
            element={element}
            formKey={formKey}
            value={value}
            isDeepElement={isDeepElement}
            onDeepChange={onDeepChange}
            groupKey={groupKey}
          />
        ),
        [element, formKey, value]
      );
    case 'upload':
      return React.useMemo(
        () => (
          <SingleUploadElement
            element={element}
            formKey={formKey}
            value={value}
            isDeepElement={isDeepElement}
            onDeepChange={onDeepChange}
            groupKey={groupKey}
          />
        ),
        [element, formKey, value]
      );
    case 'date':
      return React.useMemo(
        () => (
          <InputDate
            element={element}
            formKey={formKey}
            value={value}
            isDeepElement={isDeepElement}
            onDeepChange={onDeepChange}
            groupKey={groupKey}
          />
        ),
        [element, formKey, value]
      );
    case 'timeInput':
      return React.useMemo(
        () => (
          <InputTimeElement
            element={element}
            formKey={formKey}
            value={value}
            isDeepElement={isDeepElement}
            onDeepChange={onDeepChange}
            groupKey={groupKey}
          />
        ),
        [element, formKey, value]
      );
    case 'dropdown':
      return React.useMemo(
        () => (
          <DropDownElement
            element={element}
            formKey={formKey}
            value={value}
            isDeepElement={isDeepElement}
            onDeepChange={onDeepChange}
            groupKey={groupKey}
          />
        ),
        [element, formKey, value]
      );
    case 'checkbox':
      return React.useMemo(
        () => (
          <CheckboxElement
            element={element}
            formKey={formKey}
            value={value}
            isDeepElement={isDeepElement}
            onDeepChange={onDeepChange}
            groupKey={groupKey}
          />
        ),
        [element, formKey, value]
      );
    case 'radio':
      return React.useMemo(
        () => (
          <RadioElement
            element={element}
            formKey={formKey}
            value={value}
            isDeepElement={isDeepElement}
            onDeepChange={onDeepChange}
            groupKey={groupKey}
            radioGroupName={radioGroupName}
            radioVal={radioVal}
          />
        ),
        [element, formKey, value]
      );
    case 'repeated-composed-group':
      return React.useMemo(
        () => (
          <RepeatedComposedGroup
            element={element}
            formKey={formKey}
            value={value}
          />
        ),
        [element, formKey, value]
      );
      break;
    case 'extendable-table':
      return React.useMemo(
        () => (
          <ExtendableTable value={value} element={element} formKey={formKey} />
        ),
        [element, formKey, value]
      );
    default:
      return <></>;
  }
};
