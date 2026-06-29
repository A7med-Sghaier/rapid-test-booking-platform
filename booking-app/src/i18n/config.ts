/*************************************************************
 * booking-app - i18n.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 14.01.22 - 20:24
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { format as formatDate, isDate } from 'date-fns';
import { enUS, de } from 'date-fns/locale'; // import all locales we need

import common_de from './locales/de/common.json';
import common_en from './locales/en/common.json';
const locales = { enUS, de }; // used to look up the required locale

export const defaultNS = 'common';
export const resources = {
  en: { common_en },
  de: { common_de },
} as const;

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'de',
    ns: ['common_de'],
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
      format: (value, format, lng) => {
        if (isDate(value)) {
          // @ts-ignore
          const locale = locales[String(lng)];
          return formatDate(value, String(format), { locale });
        }
        return value;
      },
    },
    resources,
  });
