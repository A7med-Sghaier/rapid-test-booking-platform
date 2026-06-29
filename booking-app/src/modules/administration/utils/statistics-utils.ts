import { urlBuilder } from '../../../utils/http/http-utils';

/*************************************************************
 * booking-app - statistics-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 11.02.22 - 15:43
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

export const getAppointmentStatisticsByDate = async () => {
  return await fetch(urlBuilder('/statistics/appointments-by-date'), {
    method: 'Get',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
};
