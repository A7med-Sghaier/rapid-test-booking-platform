// import styles
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import React from 'react';
import { Box } from '@mui/material';
import './i18n/config';

import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Registration } from './modules/test_reservation/pages/registration';
import { BookingProvider } from './modules/test_reservation/contexts/appointment/booking-context';
import { Home } from './pages/home';
import { BookingDone } from './modules/test_reservation/pages/booking-done';
import { GlobalAppProvider } from './contexts/global-app-context';
import { RequestedPersons } from './modules/test_reservation/pages/requested-persons';
import { AuthProvider } from './contexts/auth/auth-context';
import { AdminHome } from './modules/administration/pages/admin-home';
import { BookingCancel } from './modules/test_reservation/pages/booking-cancel';
import { WarnAppPage } from './pages/warn-app-page';
import { DataFormProvider } from './contexts/forms/data-form-context';

function App() {
  const { t } = useTranslation();

  //const theme = React.useMemo(() => createTheme({ palette: ThemeBlue }), []);
  return (
    <Box className="App">
      <GlobalAppProvider>
        <BookingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/requested-persons/:persons/*"
                element={<RequestedPersons />}
              />
              <Route path="/warnapp">
                <Route path="" element={<Navigate to="/" />}></Route>
                <Route
                  path=":credentials"
                  element={
                    <DataFormProvider>
                      <WarnAppPage />
                    </DataFormProvider>
                  }
                />
              </Route>
              <Route path="/reservation/*" element={<Registration />}>
                <Route path=":step/*" element={<Registration />} />
              </Route>
              <Route path="/booking-done" element={<BookingDone />} />
              <Route path="/booking-cancel/*">
                <Route path=":bookingData" element={<BookingCancel />} />
              </Route>
              <Route
                path="admin/*"
                element={
                  <AuthProvider>
                    <AdminHome />
                  </AuthProvider>
                }
              />
            </Routes>
          </BrowserRouter>
        </BookingProvider>
      </GlobalAppProvider>
    </Box>
  );
}

export default App;
