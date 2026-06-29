/*************************************************************
 * booking-app - agents-context.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 04.02.22 - 23:29
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { createContext, useEffect, useRef, useState } from 'react';
import { getAgents } from '../utils/agent-utils';
import { socket } from '../../../utils/socket/socket-utils';

interface AgentsContextProps {
  agents: any[];
}
export const AgentsContext = createContext<AgentsContextProps>({ agents: [] });

export const AgentsProvider: React.FC = ({ children }) => {
  const [agents, setAgents] = useState([]);
  const refAgents = useRef(null);

  useEffect(() => {
    if (refAgents.current === null) {
      getAgents().then((data) => {
        refAgents.current = data;
        setAgents(data);
      });
    }

    socket.off('add-new-agent').on('add-new-agent', (msg) => {
      if (msg === 'add-agent') {
        getAgents().then((data) => {
          refAgents.current = data;
          setAgents(data);
        });
      }
    });

    socket.off('update-agent').on('update-agent', (msg) => {
      if (msg === 'update-agent') {
        getAgents().then((data) => {
          refAgents.current = data;
          setAgents(data);
        });
      }
    });
  }, []);

  return (
    <AgentsContext.Provider value={{ agents }}>
      {children}
    </AgentsContext.Provider>
  );
};
