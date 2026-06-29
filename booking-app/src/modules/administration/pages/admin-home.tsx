/*************************************************************
 * booking-app - admin-home.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 27.01.22 - 17:05
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { DataFormProvider } from '../../../contexts/forms/data-form-context';
import { LoginPage } from './login-page';
import { AuthContext } from '../../../contexts/auth/auth-context';
import { AdminPage } from './admin-page';

export const AdminHome: React.FC = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);
  return (
    <Routes>
      <Route
        path=""
        element={
          isLoggedIn ? <Navigate to="sections" /> : <Navigate to="login" />
        }
      />
      <Route path="login/*">
        <Route
          path=""
          element={
            isLoggedIn ? (
              <Navigate to="../../sections" />
            ) : (
              <DataFormProvider>
                <LoginPage />
              </DataFormProvider>
            )
          }
        />
        <Route path=":first_login/*">
          <Route
            path=""
            element={
              <DataFormProvider>
                <LoginPage />
              </DataFormProvider>
            }
          />
          <Route
            path=":data"
            element={
              isLoggedIn ? (
                <Navigate to="../../../sections" />
              ) : (
                <DataFormProvider>
                  <LoginPage />
                </DataFormProvider>
              )
            }
          />
        </Route>
      </Route>
      <Route
        path="sections/*"
        element={isLoggedIn ? <AdminPage /> : <Navigate to="../login" />}>
        <Route path=":section" element={<AdminPage />} />
      </Route>
    </Routes>
  );
};
