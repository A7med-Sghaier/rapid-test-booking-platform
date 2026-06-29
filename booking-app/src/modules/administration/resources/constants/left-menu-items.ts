/*************************************************************
 * booking-app - left-menu-items.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 27.01.22 - 15:35
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import {
  AccessTime,
  AcUnit,
  Archive,
  Biotech,
  ConfirmationNumber,
  Dashboard,
  Email,
  Group,
  Groups,
  LocationCity,
  MergeType,
  Newspaper,
  Settings,
  Timelapse,
  Today,
  ViewList,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material';

interface LeftMenuItemsProps {
  key: string | null;
  icon?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
  postfix?: string;
  classes?: string;
  subItems?: LeftMenuItemsProps[];
  isInternLink?: boolean;
}
export const LeftMenuItems: LeftMenuItemsProps[] = [
  { key: 'dashboard', icon: Dashboard },
  {
    key: 'today',
    icon: Today,
    postfix: '(' + format(new Date(), 'dd.MM.yyyy') + ')',
  },
  { key: 'appointments', icon: ViewList },
  { key: 'test-persons', icon: Groups },
  { key: 'archive', icon: Archive },
  { key: 'agents', icon: Group },
  { key: null, classes: 'my-3' },
  {
    key: 'settings',
    icon: Settings,
    subItems: [
      { key: 'basic-data', icon: Newspaper, isInternLink: true },
      { key: 'email', icon: Email, isInternLink: true },
      { key: 'test-types', icon: AcUnit, isInternLink: true },
      { key: 'opening-times', icon: AccessTime, isInternLink: true },
      { key: 'slots-settings', icon: Timelapse, isInternLink: true },
      { key: 'test-kits', icon: Biotech, isInternLink: true },
    ],
  },
];
