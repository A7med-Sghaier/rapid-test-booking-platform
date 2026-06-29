/*************************************************************
 * booking-app - input-time-element.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 08.02.22 - 19:36
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FormElementProps } from '../form-element';
import { useTranslation } from 'react-i18next';
import { DataFormContext } from '../../../contexts/forms/data-form-context';
import {
  Box,
  debounce,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
} from '@mui/material';
import clsx from 'clsx';
import { IMaskInput } from 'react-imask';
import IMask from 'imask';

interface InputTimeElementProps extends FormElementProps {}

export const InputTimeElement: React.FC<InputTimeElementProps> = ({
  children,
  element,
  formKey,
  value,
  groupKey,
  isDeepElement,
  onDeepChange,
}) => {
  const { t } = useTranslation();
  const { formValues, setFormValue } = useContext(DataFormContext);
  const [timeValue, setTimeValue] = useState<any | undefined>();

  const handleValueChange = (value: any) => {
    setTimeValue(value);
  };

  const textHelper = useCallback((): string => {
    if (!element.validator) return ' ';
    if (element.validator && typeof element.validator === 'function') {
      const helper = element.validator({ formValues, groupKey });
      if (helper === undefined) return ' ';
      // @ts-ignore
      return t(`form.errors.${helper}`);
    }
    return ' ';
  }, [formValues]);

  useEffect(() => {
    if (value || element.defaultValue) {
      setTimeValue(value || element.defaultValue);
    }
    if (!isDeepElement && !formValues[element.key] && !!value) {
      setFormValue(element.key, value);
    }
  }, [value]);

  useEffect(() => {
    if (isDeepElement && onDeepChange) {
      onDeepChange(element.key, timeValue);
    } else {
      setFormValue(element.key, timeValue);
    }
  }, [timeValue]);

  /**
  useEffect(() => {
    if (!formValues[element.key]) {
      setTimeValue(value || element.defaultValue);
    }
  }, [formValues]);
**/

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
          error={
            formValues &&
            !!element.validator &&
            element.validator({ formValues, groupKey }) !== undefined
          }
          disabled={
            !!element.disabled && !!element.disabled({ formValues, groupKey })
          }
          value={timeValue}
          onChange={handleValueChange}
          name="timeMask"
          id="formatted-text-mask-input"
          inputComponent={TimeMask as any}
        />
        <FormHelperText
          className={clsx('text-danger')}
          id={`helper-${formKey}-${element.key}`}>
          {textHelper()}
        </FormHelperText>
      </FormControl>
    </Box>
  );
};

interface CustomProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ref: any;
}

const timePattern = /^([0-1][0-9]|[2][0-3]):[0-5][0-9]$/;
const mask = 'HH:mm';
const blocks = {
  HH: { mask: IMask.MaskedRange, from: 0, to: 23 },
  mm: { mask: IMask.MaskedRange, from: 0, to: 59 },
};

const TimeMask = React.forwardRef<HTMLElement, CustomProps>(function TimeMask(
  props,
  ref
) {
  const { onChange, ...other } = props;
  const debouncedChangeHandler = debounce(onChange, 250);

  return (
    <IMaskInput
      {...other}
      mask={mask}
      pattern="HH:mm"
      blocks={blocks}
      unmask="typed"
      // @ts-ignore
      inputRef={ref}
      onAccept={(value: any, mask) => {
        if ((value && value.match(timePattern)) || value === '') {
          onChange(value);
        }
      }}
      placeholder={'HH:mm'}
    />
  );
});
