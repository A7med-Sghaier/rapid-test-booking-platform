import { apiFetch } from '../../../utils/http/http-utils';
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
  const query = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

  return await apiFetch(`/admin/appointments?${query}`, {
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
      console.warn('Could not load appointments', error);
      return [];
    });
};

export const getClients = async (): Promise<TestData[]> => {
  return await apiFetch('/admin/clients', {
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
      console.warn('Could not load clients', error);
      return [];
    });
};

export const checkInAppointment = async (
  appointmentId: string,
  personUid: string,
  agentId: string
) => {
  return await apiFetch('/admin/appointments/checkIns', {
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
  return await apiFetch('/admin/appointments/cancel', {
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
  return await apiFetch('/admin/appointments/pdf-result-for-print', {
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
