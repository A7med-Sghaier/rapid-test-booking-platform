/*************************************************************
 * booking-app - booking-context.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 16.01.22 - 15:24
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useState } from 'react';
import {
  socket,
  SOCKET_APPOINTMENT_MSG,
} from '../../../../utils/socket/socket-utils';
import { getBookedSlots } from '../../../../utils/slots/slots-util';
import { compareAsc, parseISO } from 'date-fns';
import { GlobalAppContext } from '../../../../contexts/global-app-context';
import { TestType } from '../../../../interfaces/booking-interface';

export enum APPOINTMENT_STATUS {
  WAITING = 'waiting',
  CHECKED_IN = 'checkedIn',
  TEST_PERFORMED = 'testPerformed',
  CANCELED = 'canceled',
}

export interface BookingPersonProps {
  firstName: string;
  secondName: string;
  birthDate: Date | string;
  email: string;
  email_repeat?: string;
  telephone?: string;
  address: string;
  city: string;
  postalCode: number;
  country: string;
  status: APPOINTMENT_STATUS;
}

export interface PersonProps extends BookingPersonProps {
  uid?: string;
  canceled?: boolean;
}

interface BookingContextProps {
  isLoading: boolean;
  testType: TestType | null;
  appointment: Date | null;
  persons: PersonProps[];
  yetaPolicyAccepted: boolean;
  pocPolicyAccepted: boolean;
  setAppointment: (appointment: Date | null) => void;
  setPersons: (persons: PersonProps[]) => void;
  setYetaPolicyAccepted: (value: boolean) => void;
  setPocPolicyAccepted: (value: boolean) => void;
  setTestType: (type: TestType) => void;
  addPerson: (person: PersonProps) => void;
  updatePerson: (idx: number, person: PersonProps) => void;
  removePerson: (index: number) => void;
}

export const BookingContext = React.createContext<BookingContextProps>({
  isLoading: false,
  appointment: null,
  testType: null,
  persons: [],
  yetaPolicyAccepted: false,
  pocPolicyAccepted: false,
  setAppointment: () => {},
  setTestType: () => {},
  setPersons: () => {},
  addPerson: () => {},
  updatePerson: () => {},
  setYetaPolicyAccepted: () => {},
  setPocPolicyAccepted: () => {},
  removePerson: () => {},
});

export const BookingProvider: React.FC = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appointment, setAppointment] = useState<Date | null>(null);
  const [testType, setTestType] = useState<TestType | null>(null);
  const [persons, setPersons] = useState<PersonProps[]>([]);
  const [yetaPolicyAccepted, setYetaPolicyAccepted] = useState<boolean>(false);
  const [pocPolicyAccepted, setPocPolicyAccepted] = useState<boolean>(false);
  const { center } = useContext(GlobalAppContext);

  const addPerson = (person: PersonProps) => {
    setPersons([...persons, person]);
  };

  const removePerson = (index: number) => {
    setPersons(persons.filter((_, idx) => idx !== index));
  };

  const updatePerson = (idx: number, person: PersonProps) => {
    person.status = APPOINTMENT_STATUS.WAITING;
    const copyPersons = [...persons];
    copyPersons[idx] = person;
    setPersons(copyPersons);
  };

  useEffect(() => {
    socket.off('appointments-update').on('appointments-update', (msg) => {
      if (msg === SOCKET_APPOINTMENT_MSG.APPOINTMENT_CREATED) {
        getBookedSlots().then((data) => {
          if (center && appointment && data && data.length) {
            const bookedItem = data.find(
              (item) =>
                compareAsc(parseISO(item.appointment), appointment) === 0
            );
            if (bookedItem && bookedItem.personsCount >= center.maxPerSlot) {
              setAppointment(null);
            }
          }
        });
      }
    });
  }, []);

  return (
    <BookingContext.Provider
      value={{
        isLoading,
        appointment,
        persons,
        yetaPolicyAccepted,
        pocPolicyAccepted,
        testType,
        setAppointment,
        setPersons,
        addPerson,
        updatePerson,
        setYetaPolicyAccepted,
        setPocPolicyAccepted,
        setTestType,
        removePerson,
      }}>
      {children}
    </BookingContext.Provider>
  );
};
