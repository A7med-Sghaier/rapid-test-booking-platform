import { apiFetch } from '../../../utils/http/http-utils';

/*************************************************************
 * booking-app - statistics-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 11.02.22 - 15:43
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

export const getAppointmentStatisticsByDate = async () => {
  return await apiFetch('/statistics/appointments-by-date', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .catch((error) => {
      console.warn('Could not load appointment statistics', error);
      return [];
    });
};
