/*************************************************************
 * booking-app - drop-down-element.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 15.01.22 - 16:26
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useState } from 'react';
import { FormElementProps } from '../form-element';
import {
  Box,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { ItemCountryProps } from '../../../utils/countries-util';
import { DataFormContext } from '../../../contexts/forms/data-form-context';

const useStyles = makeStyles({
  selectItem: { padding: '0.5rem 1rem' },
  optionItem: {
    '&:hover': {
      background: '#f5f7fa !important',
    },
    padding: '0.5rem 2rem !important',
    cursor: 'pointer !important',
  },
  optGroup: {
    '&:nth-of-type(1)': {
      borderTop: '0px !important',
      marginTop: '0 !important',
    },
    borderTop: '1px solid #c4c4c4 !important',
    margin: '1rem !important',
    padding: '0.5rem 0 0 0 !important',
  },
});

interface DropDownElementProps extends FormElementProps {}

export const DropDownElement: React.FC<DropDownElementProps> = ({
  element,
  formKey,
  value,
}) => {
  const { t } = useTranslation();
  const { formValues, setFormValue } = useContext(DataFormContext);

  const selectItems = buildItems(element);

  const handleValueChange = (evt: SelectChangeEvent<unknown>) => {
    let val = evt.target.value;
    if (element.key === 'testType' && typeof val === 'string') {
      val = val ? JSON.parse(val) : val;
    }
    setFormValue(element.key, val);
  };

  useEffect(() => {
    if (!formValues[element.key]) {
      if (value) {
        setFormValue(element.key, value);
      } else if (element.defaultValue) {
        if (
          element.key === 'testType' &&
          typeof element.defaultValue === 'string'
        ) {
          setFormValue(element.key, JSON.parse(element.defaultValue));
        } else {
          setFormValue(element.key, element.defaultValue);
        }
      }
    }
  }, []);

  return (
    <Box className={clsx(element.cssClasses)}>
      <FormControl variant="standard" style={{ ...element.style }}>
        <InputLabel htmlFor={`${formKey}-${element.key}`}>
          {
            // @ts-ignore
            t(`form.${element.key}`)
          }{' '}
          {element.optional && t('form.optionalRequired')}
          <span> {element.required && '*'}</span>
        </InputLabel>
        <Select
          native
          defaultValue={element.defaultValue}
          id={`${formKey}-${element.key}`}
          onChange={handleValueChange}
          // @ts-ignore
          label={t(`form.${element.key}`)}>
          <option value="" />
          {selectItems}
        </Select>
      </FormControl>
    </Box>
  );
};

interface RenderSelectGroupProps {
  groupKey: string;
  group: any[];
}
const RenderSelectGroup: React.FC<RenderSelectGroupProps> = ({
  children,
  groupKey,
  group,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <optgroup
      key={groupKey}
      className={clsx(classes.optGroup)}
      // @ts-ignore
      label={t(`form.${groupKey}`)}>
      {group &&
        group.length &&
        group.map((item: ItemCountryProps) => (
          <option
            key={`${groupKey}-${item.alpha3}`}
            className={clsx(classes.optionItem)}
            value={item.alpha3}>
            {item.name}
          </option>
        ))}
    </optgroup>
  );
};

interface RenderSelectOptionProps {
  item: any;
  labelPrefixKey: string;
}
const RenderSelectOption: React.FC<RenderSelectOptionProps> = ({
  children,
  labelPrefixKey,
  item,
}) => {
  const { t } = useTranslation();
  return (
    <option value={item.value || JSON.stringify(item)}>
      {item.label ||
        // @ts-ignore
        t(`${labelPrefixKey}.${item.key}`)}
    </option>
  );
};

const buildItems = (element: any) => {
  switch (element.items.type) {
    case 'groupedCountries':
      if (typeof element.items.groups === 'function') {
        const groups = element.items.groups('de');
        return Object.keys(groups).map((groupKey, idx) => {
          const group = groups[groupKey];
          return (
            !!group &&
            !!group.length && (
              <RenderSelectGroup
                key={groupKey}
                groupKey={groupKey}
                group={group}
              />
            )
          );
        });
      }
      break;

    case 'testTypes':
    case 'notGroupedOptions':
      return element.items.options.map((item: any, idx: number) => {
        return (
          !!item && (
            <RenderSelectOption
              key={`select-option-${item.label || item.key}`}
              item={item}
              labelPrefixKey={element.labelTranslationKey || 'test'}
            />
          )
        );
      });
      break;
  }
};
