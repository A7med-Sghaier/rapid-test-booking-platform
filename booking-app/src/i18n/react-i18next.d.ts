/*************************************************************
 * booking-app - react-i18next.d.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 14.01.22 - 20:41
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { resources, defaultNS } from './config';

// react-i18next versions higher than 11.11.0
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof resources['de'];
  }
}
