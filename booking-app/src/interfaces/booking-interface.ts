import {
  APPOINTMENT_STATUS,
  PersonProps,
} from '../modules/test_reservation/contexts/appointment/booking-context';

/*************************************************************
 * booking-app - booking-interface.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 21.01.22 - 22:32
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

export interface TestKit {
  isActive: boolean;
  label: string;
}
export interface TestType {
  isActive?: boolean;
  label: string;
  price: string;
}

export interface CenterProps {
  name: string;
  address: string;
  city: string;
  postalCode: number;
  country: string;
  openingTimes: any;
  maxPerSlot: number;
  healthOfficeEmail: string;
  logo?: string;
  testKits: TestKit[];
  testTypes: TestType[];
}

export interface BookingProps {
  center: CenterProps;
  testType: TestType;
  appointment: Date;
  persons: PersonProps[];
  status: APPOINTMENT_STATUS;
  yetaPolicyAccepted: boolean;
  pocPolicyAccepted: boolean;
  createdBy?: string;
  appointmentUid?: string;
}
