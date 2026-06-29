/*************************************************************
 * booking-app - input-date.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 15.01.22 - 16:26
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Box, FormControl, Input, InputLabel } from '@mui/material';
import { FormElementProps } from '../form-element';
import { useTranslation } from 'react-i18next';
import { DataFormContext } from '../../../contexts/forms/data-form-context';
import clsx from 'clsx';
import { IMaskInput } from 'react-imask';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface InputDateProps extends FormElementProps {}
const maskMap = {
  fr: '__/__/____',
  en: '__/__/____',
  ru: '__.__.____',
  de: 'tt.mm.yyyy',
};

export const InputDate: React.FC<InputDateProps> = ({
  element,
  formKey,
  value,
}) => {
  const { t } = useTranslation();
  const { formValues, setFormValue } = useContext(DataFormContext);

  // eslint-disable-next-line no-case-declarations
  const [dateValue, setDateValue] = useState<Date | undefined>();
  const handleValueChange = (value: any) => {
    setDateValue(value);
  };

  useEffect(() => {
    const defaultVal = typeof value === 'string' ? parseISO(value) : value;
    if (!dateValue) setDateValue(defaultVal || element.defaultValue);
  }, []);

  useEffect(() => {
    setFormValue(element.key, dateValue);
  }, [dateValue]);

  useEffect(() => {
    if (!formValues[element.key]) {
      const dateVal = typeof value === 'string' ? parseISO(value) : value;
      setDateValue(dateVal || element.defaultValue);
    }
  }, [formValues]);

  return (
    <Box className={clsx(element.cssClasses)}>
      <FormControl variant="standard" style={{ ...element.style }}>
        <InputLabel htmlFor="formatted-text-mask-input">
          {
            // @ts-ignore
            t(`form.${element.key}`)
          }
          {element.optional && t('form.optionalRequired')}
          <span> {element.required && '*'}</span>
        </InputLabel>
        <Input
          inputProps={{ inputMode: 'numeric' }}
          value={dateValue}
          onChange={handleValueChange}
          name="dateMask"
          id="formatted-text-mask-input"
          inputComponent={DateMask as any}
        />
      </FormControl>
    </Box>
  );
};

interface CustomProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ref: any;
}

export const DateMask = React.forwardRef<HTMLElement, CustomProps>(
  function DateMask(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={Date}
        unmask="typed"
        // @ts-ignore
        inputRef={ref}
        onAccept={(value: any, mask) => {
          if (value) {
            onChange(value);
          }
        }}
        placeholder={maskMap.de}
      />
    );
  }
);
