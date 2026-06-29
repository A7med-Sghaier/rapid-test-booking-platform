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
import {
  Box,
  Checkbox,
  debounce,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface RadioElementProps extends FormElementProps {
  groupKey?: string;
  radioGroupName?: string;
}

export const RadioElement: React.FC<RadioElementProps> = ({
  children,
  element,
  formKey,
  radioGroupName,
  value,
  isDeepElement,
  onDeepChange,
  groupKey,
  radioVal,
}) => {
  const { t } = useTranslation();
  const { setFormValue } = useContext(DataFormContext);

  return (
    <Box className={clsx(element.cssClasses)}>
      <FormControlLabel
        label={
          element.labelTranslationKey
            ? // @ts-ignore
              t(element.labelTranslationKey)
            : element.label
        }
        control={<Radio name={radioGroupName} value={radioVal} />}
      />
    </Box>
  );
};
