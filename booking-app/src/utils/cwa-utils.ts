import { urlBuilder } from './http/http-utils';
import { AGREEMENT_TYPE } from '../pages/warn-app-page';

/*************************************************************
 * booking-app - cwa-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 15.02.22 - 14:42
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
export const cwaTransmission = async (
  credentials: string,
  agreementType: AGREEMENT_TYPE,
  cwaPolicy: boolean
) => {
  return await fetch(urlBuilder('/admin/cwa-transmission'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ credentials, agreementType, cwaPolicy }),
  }).then((response) => {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
};
