/*************************************************************
 * booking-app - interfaces.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 28.01.22 - 23:19
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { PersonProps } from '../../test_reservation/contexts/appointment/booking-context';
import { TestType } from '../../../interfaces/booking-interface';

export enum TEST_RESULT {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  INVALID = 'invalid',
}

export interface PersonPropsForAdmin extends PersonProps {
  checkedIn?: boolean;
  testResult?: string;
  checkedInAt?: string;
  uid?: string;
}

export interface TestData {
  _id: string;
  testType: TestType;
  appointment: string;
  person: PersonPropsForAdmin;
  personIdx: number;
  appointmentUid: string;
  status?: string;
  testResult?: string;
}
