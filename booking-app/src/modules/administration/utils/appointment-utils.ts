import { urlBuilder, urlParamsBinder } from '../../../utils/http/http-utils';
import { TestData } from '../resources/interfaces';

/*************************************************************
 * booking-app - appointment-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 29.01.22 - 09:52
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

export const getAppointmentsByInterval = async (
  from: string,
  to: string
): Promise<TestData[]> => {
  return await fetch(
    urlParamsBinder(urlBuilder('/admin/appointments'), [
      { key: 'from', val: from },
      { key: 'to', val: to },
    ]),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  ).then((response) => {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
};

export const getClients = async (): Promise<TestData[]> => {
  return await fetch(urlBuilder('admin/clients'), {
    method: 'GET',
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

export const checkInAppointment = async (
  appointmentId: string,
  personUid: string,
  agentId: string
) => {
  return await fetch(urlBuilder('/admin/appointments/checkIns'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ appointmentId, personUid, agentId }),
  }).then((response) => {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
};

export const cancelAppointment = async (
  appointmentId: string,
  personUid: string[],
  agentId: string
) => {
  return await fetch(urlBuilder('/admin/appointments/cancel'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ appointmentId, personUid, agentId }),
  }).then((response) => {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
};

export const getPDFResult = async (personUid: string): Promise<any> => {
  return await fetch(urlBuilder('/admin/appointments/pdf-result-for-print'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ personUid }),
  }).then((response) => {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
};
