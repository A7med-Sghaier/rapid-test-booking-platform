import { urlBuilder } from '../http/http-utils';

/*************************************************************
 * booking-app - settings-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 30.01.22 - 22:30
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

export const saveSettings = async (data: any) => {
  return await fetch(urlBuilder('/admin/settings'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then((response) => {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
};

export const getSettings = async () => {
  return await fetch(urlBuilder('/admin/settings'), {
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
