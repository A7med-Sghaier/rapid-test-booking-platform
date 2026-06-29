/*************************************************************
 * booking-app - bookin-utils.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 21.01.22 - 22:30
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { urlBuilder } from '../http/http-utils';
import { BookingProps } from '../../interfaces/booking-interface';

export const createBooking = async (data: BookingProps) => {
  return await fetch(urlBuilder('/book-test-appointment'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then((response) => response.json());
};
