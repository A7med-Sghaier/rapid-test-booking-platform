/*************************************************************
 * booking-app - today-appointments-context.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 28.01.22 - 16:19
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { createContext, useEffect, useState } from 'react';
import { TestData } from '../resources/interfaces';
import {
  socket,
  SOCKET_APPOINTMENT_MSG,
} from '../../../utils/socket/socket-utils';
import {
  getAppointmentsByInterval,
  getClients,
} from '../utils/appointment-utils';
import { addDays } from 'date-fns';

interface AppointmentsRangeProps {
  from: Date;
  to: Date;
}
interface AppointmentsContextProps {
  appointments: TestData[];
  dateFrom: Date;
  dateTo: Date;
  setDateFrom: (date: Date) => void;
  setDateTo: (date: Date) => void;
}

export const AppointmentsContext = createContext<AppointmentsContextProps>({
  appointments: [],
  dateFrom: new Date(),
  dateTo: new Date(),
  setDateFrom: (date) => {},
  setDateTo: (date) => {},
});

export const AppointmentsProvider: React.FC = ({ children }) => {
  const now = new Date();
  const [appointments, setAppointments] = useState<TestData[]>([]);
  const [dateFrom, setDateFrom] = useState(addDays(now, +1));
  const [dateTo, setDateTo] = useState(addDays(dateFrom, 6));

  const fetchAppointments = () => {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    from.setHours(0);
    from.setMinutes(0);
    to.setHours(23);
    to.setMinutes(59);
    getAppointmentsByInterval(from.toISOString(), to.toISOString()).then(
      (data) => {
        setAppointments(data);
      }
    );
  };

  useEffect(() => {
    fetchAppointments();
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchAppointments();
    socket.off('appointments-update').on('appointments-update', (msg) => {
      if (
        msg === SOCKET_APPOINTMENT_MSG.APPOINTMENT_MODIFIED ||
        msg === SOCKET_APPOINTMENT_MSG.APPOINTMENT_CREATED ||
        msg === SOCKET_APPOINTMENT_MSG.APPOINTMENT_CANCELED
      ) {
        fetchAppointments();
      }
    });
  }, []);

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        dateFrom,
        dateTo,
        setDateFrom,
        setDateTo,
      }}>
      {children}
    </AppointmentsContext.Provider>
  );
};
