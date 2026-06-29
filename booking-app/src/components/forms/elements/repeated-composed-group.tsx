/*************************************************************
 * booking-app - repeated-composed-group.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 30.01.22 - 14:09
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect } from 'react';
import { Box } from '@mui/material';
import { FormElement, FormElementProps } from '../form-element';
import { DataFormContext } from '../../../contexts/forms/data-form-context';
import clsx from 'clsx';

interface RepeatedComposedGroupProps extends FormElementProps {
  value: any;
}
export const RepeatedComposedGroup: React.FC<RepeatedComposedGroupProps> = ({
  children,
  element,
  formKey,
  value,
}) => {
  const repeatedGroup = element.repeatedGroup;
  const { formValues, setFormValue } = useContext(DataFormContext);

  const handleDeepChange = (key: string, value: any) => {
    if (repeatedGroup) {
      setFormValue(element.key, {
        ...formValues[element.key],
        [key]: {
          ...(formValues[element.key] ? formValues[element.key][key] : {}),
          ...value[key],
        },
      });
    }
  };

  return (
    <Box className={clsx('w-100')}>
      {repeatedGroup?.groupKeys?.map((groupKey) => {
        return (
          <Box
            key={`composed-group-${groupKey}`}
            className={repeatedGroup?.cssClasses}>
            {repeatedGroup?.fields?.map((field) => {
              const fieldElement = { ...field };
              Object.keys(fieldElement).forEach((attrKey: string) => {
                // @ts-ignore
                if (typeof fieldElement[attrKey] === 'string') {
                  // @ts-ignore
                  fieldElement[attrKey] = fieldElement[attrKey].replace(
                    '{{groupKey}}',
                    groupKey
                  );
                }
              });
              return (
                <FormElement
                  key={`composed-group-${groupKey}-element-${fieldElement.key}`}
                  element={fieldElement}
                  formKey={formKey}
                  isDeepElement
                  groupKey={groupKey}
                  value={
                    value
                      ? value[groupKey]
                        ? value[groupKey][fieldElement.key]
                        : undefined
                      : undefined
                  }
                  onDeepChange={(key, val) => {
                    handleDeepChange(groupKey, { [groupKey]: { [key]: val } });
                  }}
                />
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};
