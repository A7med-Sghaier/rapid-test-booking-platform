/*************************************************************
 * booking-app - global-app-context.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 22.01.22 - 14:12
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

import React, { createContext, useEffect, useState } from 'react';
import { CenterProps } from '../interfaces/booking-interface';
import { getSettings } from '../utils/global/settings-utils';
import { socket } from '../utils/socket/socket-utils';

interface GlobalAppContextProps {
  center: CenterProps | null;
}

export const GlobalAppContext = createContext<GlobalAppContextProps>({
  center: null,
});

export const GlobalAppProvider: React.FC = ({ children }) => {
  const [center, setCenter] = useState<CenterProps | null>(null);

  useEffect(() => {
    getSettings().then((result) => {
      if (result && result.length) setCenter(result[0]);
    });

    socket.off('settings-update').on('settings-update', (msg) => {
      getSettings().then((data) => {
        if (data && data.length) {
          setCenter({ ...data[0] });
        }
      });
    });
  }, []);

  return (
    <GlobalAppContext.Provider value={{ center }}>
      {children}
    </GlobalAppContext.Provider>
  );
};
