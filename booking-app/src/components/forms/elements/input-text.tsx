/*************************************************************
 * booking-app - input-text.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 15.01.22 - 16:25
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import {
  Box,
  debounce,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
} from '@mui/material';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FormElementProps } from '../form-element';
import { useTranslation } from 'react-i18next';
import { DataFormContext } from '../../../contexts/forms/data-form-context';
import clsx from 'clsx';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface InputTextProps extends FormElementProps {}

export const InputText: React.FC<InputTextProps> = ({
  element,
  formKey,
  value,
  groupKey,
  isDeepElement,
  onDeepChange,
}) => {
  const { t } = useTranslation();
  const { formValues, setFormValue, initialising } =
    useContext(DataFormContext);
  const [inputValue, setInputValue] = React.useState<any>('');
  const [showPswd, setShowPswd] = React.useState<boolean>(false);

  const handleClickShowPassword = () => {
    setShowPswd(!showPswd);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  let EndAdornment: any = null;
  if (element.type === 'password') {
    EndAdornment = (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={handleClickShowPassword}
          onMouseDown={handleMouseDownPassword}>
          {showPswd ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    );
  } else if (element.endAdornment) {
    <InputAdornment position="end">{element.endAdornment}</InputAdornment>;
  }

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

  const handleValueChange = (
    evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setInputValue(evt.target.value);
  };

  const emitValueChange = () => {
    if (isDeepElement && onDeepChange) {
      onDeepChange(element.key, inputValue);
    } else {
      setFormValue(element.key, inputValue);
    }
  };

  const debouncedChangeHandler = debounce(emitValueChange, 250);

  useEffect(() => {
    if (value || element.defaultValue) {
      setInputValue(value || element.defaultValue);
    }

    if (!isDeepElement && !formValues[element.key] && !!value) {
      setFormValue(element.key, value);
    }
  }, [value]);

  useEffect(() => {
    if (!initialising) debouncedChangeHandler();
  }, [inputValue]);

  return (
    <Box className={clsx(element.cssClasses)}>
      <FormControl variant="standard" style={{ ...element.style }}>
        <InputLabel htmlFor={`${formKey}-${element.key}`}>
          {
            // @ts-ignore
            t(`form.${element.label || element.key}`)
          }{' '}
          {element.optional && t('form.optionalRequired')}
          <span> {element.required && '*'}</span>
        </InputLabel>
        <Input
          error={
            formValues &&
            !!element.validator &&
            element.validator({ formValues, groupKey }) !== undefined
          }
          disabled={
            !!element.disabled && !!element.disabled({ formValues, groupKey })
          }
          type={
            element.type === 'password'
              ? showPswd
                ? 'text'
                : 'password'
              : element.type
          }
          inputProps={{
            inputMode: element.type === 'number' ? 'numeric' : undefined,
          }}
          value={inputValue}
          required={element.required}
          id={`${formKey}-${element.key}`}
          onChange={handleValueChange}
          aria-describedby={`helper-${formKey}-${element.key}`}
          endAdornment={EndAdornment}
          startAdornment={
            element.startAdornment && (
              <InputAdornment position="start">
                <element.startAdornment />
              </InputAdornment>
            )
          }
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
