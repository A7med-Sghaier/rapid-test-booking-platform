/*************************************************************
 * booking-app - form-element-type-props.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 14.01.22 - 19:54
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { CSSProperties } from 'react';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material';
import { FormTypeProps } from './form-type-props';

interface SelectItemsProps {
  type: string;
  groups?: any;
  items?: any[];
}
interface RepeatedGroupProps {
  key: string;
  groupKeys: string[];
  fields?: FormElementTypeProps[];
  cssClasses?: string;
}

interface CellProps extends FormElementTypeProps {}

interface RowGroupProps {
  key?: string;
  cells: CellProps[];
  cssClasses?: string;
  type?: string;
}

export interface FormElementTypeProps {
  elementType: string;
  type?:
    | 'numeric'
    | 'number'
    | 'text'
    | 'none'
    | 'tel'
    | 'url'
    | 'email'
    | 'decimal'
    | 'search'
    | 'password'
    | 'date'
    | 'control'
    | undefined;
  key: string;
  required?: boolean;
  style?: CSSProperties;
  cssClasses?: string;
  validator?: (option: any) => string | undefined;
  disabled?: (option: any) => boolean;
  items?: any;
  defaultValue?: any;
  label?: any;
  labelTranslationKey?: string;
  endAdornment?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  startAdornment?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  repeatedGroup?: RepeatedGroupProps;
  rowGroup?: RowGroupProps;
  optional?: boolean;
  multiple?: boolean;
  accept?: string;
  radioGroupName?: string;
  showImage?: boolean;
  IconButton?: any;
  controlAddForm?: FormTypeProps;
  valueKey?: string;
  logoViewStyle?: CSSProperties;
  excludeOn?: (options: any) => boolean;
}
