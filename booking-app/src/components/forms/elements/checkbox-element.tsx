/*************************************************************
 * booking-app - checkbox-element.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 30.01.22 - 14:40
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useState } from 'react';
import { FormElementProps } from '../form-element';
import { DataFormContext } from '../../../contexts/forms/data-form-context';
import clsx from 'clsx';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CheckboxElementProps extends FormElementProps {
  groupKey?: string;
}

export const CheckboxElement: React.FC<CheckboxElementProps> = ({
  children,
  element,
  formKey,
  value,
  isDeepElement,
  onDeepChange,
  groupKey,
}) => {
  const { t } = useTranslation();
  const [checkValue, setCheckValue] = useState<boolean>(
    value === true ? true : false
  );
  const { setFormValue } = useContext(DataFormContext);

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setCheckValue(evt.target.checked);
  };

  useEffect(() => {
    setCheckValue(!!value || !!element.defaultValue);
  }, [value, element.defaultValue]);

  useEffect(() => {
    if (isDeepElement && onDeepChange) {
      onDeepChange(element.key, checkValue);
    } else {
      setFormValue(element.key, checkValue);
    }
  }, [checkValue]);

  return (
    <Box className={clsx(element.cssClasses)}>
      <FormControlLabel
        label={
          element.labelTranslationKey
            ? // @ts-ignore
              t(element.labelTranslationKey)
            : element.label
        }
        control={<Checkbox checked={checkValue} onChange={handleChange} />}
      />
    </Box>
  );
};
