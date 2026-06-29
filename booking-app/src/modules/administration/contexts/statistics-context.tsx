/*************************************************************
 * booking-app - statistics-context.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 11.02.22 - 15:38
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { createContext, useEffect, useState } from 'react';
import { getAppointmentStatisticsByDate } from '../utils/statistics-utils';

export interface AppointmentStatisticsByDateProps {
  date: string;
  count: number;
}

interface StatisticsContextProps {
  appointmentStatisticsByDate?: AppointmentStatisticsByDateProps[];
}

export const StatisticsContext = createContext<StatisticsContextProps>({});

export const StatisticsProvider: React.FC = ({ children }) => {
  const [appointmentStatisticsByDate, setAppointmentStatisticsByDate] =
    useState([]);

  useEffect(() => {
    getAppointmentStatisticsByDate().then((data) => {
      setAppointmentStatisticsByDate(data);
    });
  }, []);
  return (
    <StatisticsContext.Provider value={{ appointmentStatisticsByDate }}>
      {children}
    </StatisticsContext.Provider>
  );
};
