import { FormElementTypeProps } from './form-element-type-props';
import { CSSProperties } from 'react';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material';

/*************************************************************
 * booking-app - form-type-props.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 14.01.22 - 19:54
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

export interface FormTypeProps {
  type: string;
  key: string;
  indicators: string[];
  fields: FormElementTypeProps[];
  style?: CSSProperties;
  cssClasses?: string;
  endAdornment?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  startAdornment?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
}
