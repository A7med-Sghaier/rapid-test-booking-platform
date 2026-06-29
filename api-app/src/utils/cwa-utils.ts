/*************************************************************
 * api-app - cwa-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 18.02.22 - 18:49
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { convertToSHA256 } from './encrypt-decrypt-utils';
import { format, parseISO } from 'date-fns';
import https from 'https';

export const buildCwaHash = ({
  agreement,
  salt,
  jsonObj,
  timestamp,
  person,
  uid,
}) => {
  let hash;
  if (agreement === 'transmissionAnonym') {
    const stringToHash = [timestamp, salt].join('#');
    hash = convertToSHA256(stringToHash);
    jsonObj.hash = hash;
  } else if (agreement === 'transmissionOfData') {
    const dob = format(parseISO(person.birthDate), 'yyyy-MM-dd');
    const stringToHash = [
      dob,
      person.firstName,
      person.secondName,
      timestamp,
      uid,
      salt,
    ].join('#');
    hash = convertToSHA256(stringToHash);
    jsonObj.fn = person.firstName;
    jsonObj.ln = person.secondName;
    jsonObj.testid = uid;
    jsonObj.dob = dob;
    jsonObj.hash = hash;
  }
  return hash;
};
