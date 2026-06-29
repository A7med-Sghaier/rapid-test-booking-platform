/*************************************************************
 * booking-app - http-utils.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 21.01.22 - 22:14
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
export const urlBuilder = (path: string) => {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  if (process.env.REACT_APP_API_PATH_PREFIX) {
    path = '/' + process.env.REACT_APP_API_PATH_PREFIX + path;
  }

  return [
    process.env.REACT_APP_API_HOST,
    ':',
    process.env.REACT_APP_API_PORT,
    path,
  ].join('');
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
