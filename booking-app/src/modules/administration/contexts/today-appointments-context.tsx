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

interface AppointmentsRangeProps {
  from: Date;
  to: Date;
}
interface TodayAppointmentsContextProps {
  appointments: TestData[];
  appointmentsRange: AppointmentsRangeProps;
  setAppointmentsRange: (range: AppointmentsRangeProps) => void;
}

export const TodayAppointmentsContext =
  createContext<TodayAppointmentsContextProps>({
    appointments: [],
    appointmentsRange: { from: new Date(), to: new Date() },
    setAppointmentsRange: (range) => {},
  });

export const TodayAppointmentsProvider: React.FC = ({ children }) => {
  const [appointments, setAppointments] = useState<TestData[]>([]);

  const [appointmentsRange, setAppointmentsRange] =
    useState<AppointmentsRangeProps>({
      from: new Date(),
      to: new Date(),
    });

  appointmentsRange.from.setUTCHours(0);
  const from = appointmentsRange.from.toISOString();
  appointmentsRange.to.setUTCHours(23);
  const to = appointmentsRange.to ? appointmentsRange.to.toISOString() : '';

  useEffect(() => {
    getAppointmentsByInterval(from, to).then((data) => {
      setAppointments(data);
    });

    socket.off('appointments-update').on('appointments-update', (msg) => {
      if (
        msg === SOCKET_APPOINTMENT_MSG.APPOINTMENT_MODIFIED ||
        msg === SOCKET_APPOINTMENT_MSG.APPOINTMENT_CREATED ||
        msg === SOCKET_APPOINTMENT_MSG.APPOINTMENT_CANCELED
      ) {
        getAppointmentsByInterval(from, to).then((data) => {
          setAppointments(data);
        });
      }
    });
  }, []);

  return (
    <TodayAppointmentsContext.Provider
      value={{
        appointments,
        appointmentsRange,
        setAppointmentsRange,
      }}>
      {children}
    </TodayAppointmentsContext.Provider>
  );
};
