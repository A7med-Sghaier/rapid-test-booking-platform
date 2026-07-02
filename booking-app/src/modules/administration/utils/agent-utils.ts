import { apiFetch } from '../../../utils/http/http-utils';

/*************************************************************
 * booking-app - agent-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 04.02.22 - 21:36
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

export const addAgent = async (data: any) => {
  return await apiFetch('/admin/add-agent', {
    method: 'PUT',
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

export const updateAgent = async (id: string, data: any) => {
  return await apiFetch('/admin/update-agent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, data }),
  }).then((response) => {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
};

export const getAgents = async () => {
  return await apiFetch('/admin/agents', {
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
      console.warn('Could not load agents', error);
      return [];
    });
};
