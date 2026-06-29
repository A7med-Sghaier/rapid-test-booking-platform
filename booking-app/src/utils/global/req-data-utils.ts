import { urlBuilder } from '../http/http-utils';

/*************************************************************
 * booking-app - req-data-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 22.01.22 - 17:37
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

export const ReqDataPerEmail = async (email: string) => {
  return await fetch(urlBuilder('/request-qr'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  }).then((response) => response.json());
};
