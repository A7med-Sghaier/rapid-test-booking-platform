/*************************************************************
 * booking-app - http-utils.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 21.01.22 - 22:14
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
const API_HOST = process.env.REACT_APP_API_HOST || 'http://localhost';
const API_PORT = process.env.REACT_APP_API_PORT || '3500';
const API_PATH_PREFIX = process.env.REACT_APP_API_PATH_PREFIX || 'test-app-api';

const normalizePath = (path: string) => {
  return path.startsWith('/') ? path : '/' + path;
};

export const getApiBaseUrl = () => {
  return [API_HOST, ':', API_PORT].join('');
};

export const urlBuilder = (path: string) => {
  path = normalizePath(path);

  if (API_PATH_PREFIX) {
    path = '/' + API_PATH_PREFIX + path;
  }

  return [getApiBaseUrl(), path].join('');
};

export const directUrlBuilder = (path: string) => {
  return [getApiBaseUrl(), normalizePath(path)].join('');
};

export const apiFetch = async (path: string, init?: RequestInit) => {
  const response = await fetch(urlBuilder(path), init);

  if (response.status !== 404 || !API_PATH_PREFIX) {
    return response;
  }

  return fetch(directUrlBuilder(path), init);
};

export const urlParamsBinder = (
  url: string,
  params: { key: string; val: string }[]
) => {
  return params.reduce((bindedUrl, param, idx) => {
    const operator = idx === 0 ? '?' : '&';
    return [bindedUrl, operator, param.key, '=', param.val].join('');
  }, url);
};
