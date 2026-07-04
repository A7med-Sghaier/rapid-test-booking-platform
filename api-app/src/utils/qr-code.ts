/*************************************************************
 * api-app - qr-code.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 21.01.22 - 23:46
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { format, parse } from 'date-fns';
import * as crypto from 'crypto';

const QRCode = require('qrcode');

export const generateQRCode = async (dataToEncode: string) => {
  return new Promise<string>((resolve, reject) => {
    QRCode.toDataURL(dataToEncode, function (err, url) {
      if (url) {
        resolve(url);
      }

      if (err) {
        reject('error occurred when generate QR-Code');
      }
    });
  });
};

export const generateAppointmentID = (stringDate?) => {
  let stringTempl = 'xxxxxxxx-xxxx-yxxxxxxxxx';
  if (stringDate) {
    const stringToEncode = format(new Date(stringDate), 'ddMMyyyy');
    stringTempl = `${stringToEncode}-xxxx-yxxxxxxxxx`;
  }

  return stringTempl.replace(/[xy]/g, (c) => {
    const r = crypto.randomInt(0, 16);
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(24);
  });
};
