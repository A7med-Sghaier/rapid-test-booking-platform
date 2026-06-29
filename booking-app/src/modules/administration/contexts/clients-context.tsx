/*************************************************************
 * booking-app - clients-context.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 13.02.22 - 18:51
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { createContext, useEffect, useState } from 'react';
import { BookingPersonProps } from '../../test_reservation/contexts/appointment/booking-context';
import { getClients } from '../utils/appointment-utils';

interface ClientsContextProps {
  clients: BookingPersonProps[];
}

export const ClientsContext = createContext<ClientsContextProps>({
  clients: [],
});

export const ClientsProvider: React.FC = ({ children }) => {
  const [clients, setClients] = useState<any[]>([]);

  const fetchClients = () => {
    getClients().then((data) => {
      setClients(data);
    });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <ClientsContext.Provider value={{ clients }}>
      {children}
    </ClientsContext.Provider>
  );
};
