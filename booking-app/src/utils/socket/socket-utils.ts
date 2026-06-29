import { io } from 'socket.io-client';

/*************************************************************
 * booking-app - socket-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 29.01.22 - 23:24
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

export enum SOCKET_APPOINTMENT_MSG {
  APPOINTMENT_MODIFIED = 'appointment-modified',
  APPOINTMENT_CREATED = 'appointment-created',
  APPOINTMENT_CANCELED = 'appointment-canceled',
}

export const socket = io(
  process.env.REACT_APP_API_HOST +
    (process.env.REACT_APP_API_PORT ? ':' + process.env.REACT_APP_API_PORT : '')
);
