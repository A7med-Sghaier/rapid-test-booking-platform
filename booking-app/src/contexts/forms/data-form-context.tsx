/*************************************************************
 * booking-app - data-form-context.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 16.01.22 - 17:52
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormTypeProps } from '../../interfaces/form-type-props';
import { FormDataProps, initFormData } from '../../utils/form/form-utils';

interface DataFormContextProps {
  initialising: boolean;
  formTemplate: FormTypeProps | undefined;
  formValues: { [k: string]: any };
  formValidators: any[];

  setFormTemplate: (template: FormTypeProps) => void;
  setFormValue: (fieldKey: string, value: any) => void;
  setFormValues: (values: { [k: string]: any }) => void;
  setValidField: (fieldKey: string, validity: boolean) => void;
  checkFormValidation: () => boolean;
  cleanForm: () => void;
}

export const DataFormContext = React.createContext<DataFormContextProps>({
  initialising: true,
  formTemplate: {} as FormTypeProps,
  formValues: {},
  formValidators: [],

  setFormTemplate: (template) => {},
  setFormValue: (fieldKey, value) => {},
  setFormValues: (values) => {},
  setValidField: (fieldKey, validity) => {},
  checkFormValidation: () => false,
  cleanForm: () => {},
});

interface DataFormProviderProps {}

export const DataFormProvider: React.FC<DataFormProviderProps> = ({
  children,
}) => {
  const [formTemplate, setFormTemplate] = useState<FormTypeProps>();
  const [formValues, setFormValues] = useState<{ [k: string]: any }>({});
  const [formValidators, setFormValidators] = useState<any[]>([]);
  const [validFields, setValidFields] = useState<{
    [k: string]: boolean;
  }>({});
  const refFormValues = useRef<any>();
  const refFormValids = useRef<any>();
  const initialising = useRef<boolean>(true);

  const setFormValue = (fieldKey: string, value: any) => {
    if (refFormValues.current !== null && formValues[fieldKey] !== value) {
      refFormValues.current = { ...refFormValues.current, [fieldKey]: value };
      setFormValues({ ...refFormValues.current });
    }
  };

  const setValidField = (fieldKey: string, validity: boolean) => {
    if (refFormValids.current !== null && validFields[fieldKey] !== validity) {
      refFormValids.current = {
        ...refFormValids.current,
        [fieldKey]: validity,
      };
      setValidFields({ ...refFormValids.current });
    }
  };

  const checkFormValidation = useCallback(() => {
    Object.keys(validFields).every((key) => {
      return validFields[key] === true;
    });
    return Object.keys(validFields).every((key) => validFields[key] === true);
  }, [validFields]);

  const initForm = (clean = false) => {
    initialising.current = true;

    if (formTemplate) {
      const { values, validators } = initFormData(formTemplate);
      if (clean || Object.keys(values) !== Object.keys(formValues)) {
        setFormValues(values);
        setFormValidators(validators);
      }
    } else {
      initialising.current = false;
    }
  };

  const cleanForm = () => {
    refFormValues.current = null;
    initForm(true);
  };

  useEffect(() => {
    if (refFormValues.current === null && !!Object.keys(formValues).length) {
      refFormValues.current = { ...formValues };
    }
    initialising.current = false;
  }, [formValues]);

  useEffect(() => {
    initForm();
  }, [formTemplate]);

  return (
    <DataFormContext.Provider
      value={{
        initialising: initialising.current,
        formTemplate,
        formValues,
        formValidators,
        setFormTemplate,
        setFormValue,
        setFormValues,
        setValidField,
        checkFormValidation,
        cleanForm,
      }}>
      {children}
    </DataFormContext.Provider>
  );
};
