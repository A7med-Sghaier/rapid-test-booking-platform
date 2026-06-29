/*************************************************************
 * booking-app - admin-page.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 26.01.22 - 19:25
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import clsx from 'clsx';

import { Box, Container, Divider } from '@mui/material';
import { LeftSidebarMenu } from '../components/left-sidebar-menu';
import { TopSidebarMenu } from '../components/top-sidebar-menu';
import { DataFormProvider } from '../../../contexts/forms/data-form-context';
import { Today } from './today';
import { Settings } from './settings';
import { TodayAppointmentsProvider } from '../contexts/today-appointments-context';
import { AgentsPage } from './agents-page';
import { AgentsProvider } from '../contexts/agents-context';
import { default as NewAppointmentDialog } from '../components/cards/dialogs/new-appointment-dialog';
import { DashboardPage } from './dashboard-page';
import { StatisticsProvider } from '../contexts/statistics-context';
import { AppointmentsPage } from './appointments-page';
import { AppointmentsProvider } from '../contexts/appointments-context';
import { ClientsProvider } from '../contexts/clients-context';

export const AdminPage: React.FC = ({ children }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  return (
    <Container maxWidth={false} className={clsx('d-flex w-100 h-100 p-0 m-0')}>
      <LeftSidebarMenu className="d-flex flex-column col-3 col-md-2" />
      <Divider />
      <Box className={clsx('d-flex  flex-column flex-grow-1 bg-light')}>
        <TopSidebarMenu openNewAppointmentDialog={setOpenDialog} />
        <Box className={clsx('d-flex flex-column flex-grow-1 overflow-scroll')}>
          <Routes>
            <Route path="" element={<Navigate to="today" />} />
            <Route
              path="appointments"
              element={
                <AppointmentsProvider>
                  <DataFormProvider>
                    <AppointmentsPage />
                  </DataFormProvider>
                </AppointmentsProvider>
              }
            />
            <Route
              path="dashboard"
              element={
                <StatisticsProvider>
                  <DashboardPage />
                </StatisticsProvider>
              }
            />
            <Route
              path="today"
              element={
                <TodayAppointmentsProvider>
                  <DataFormProvider>
                    <Today />
                  </DataFormProvider>
                </TodayAppointmentsProvider>
              }
            />
            <Route path="settings" element={<Settings />} />
            <Route
              path="agents"
              element={
                <AgentsProvider>
                  <AgentsPage />
                </AgentsProvider>
              }
            />
          </Routes>
          <ClientsProvider>
            <DataFormProvider>
              <NewAppointmentDialog
                openNewAppointmentForm={openDialog}
                openDialog={setOpenDialog}
              />
            </DataFormProvider>
          </ClientsProvider>
        </Box>
      </Box>
    </Container>
  );
};
