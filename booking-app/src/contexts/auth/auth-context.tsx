/*************************************************************
 * booking-app - auth-context.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 26.01.22 - 21:33
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { createContext, useEffect, useState } from 'react';
import { urlBuilder } from '../../utils/http/http-utils';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

export interface LoginParamsProps {
  userName: string;
  psw: string;
}

export interface IdentityProps {
  id: string;
  fullName: string;
  avatar: string;
  username: string;
  email: string;
  roles: string[];
}

interface AuthContextProps {
  isLoggedIn: boolean;
  failure: string | undefined;
  login: (params: LoginParamsProps) => Promise<void>;
  logOut: () => void;
  checkError: (error: any) => Promise<void>;
  checkAuth: () => Promise<void>;
  getIdentity: () => Promise<IdentityProps>;
  getPermissions: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  failure: undefined,
  login: (params) => Promise.resolve(),
  logOut: () => {},
  checkError: (eror) => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  getIdentity: () => Promise.resolve({} as IdentityProps),
  getPermissions: () => Promise.resolve(),
});

export const AuthProvider: React.FC = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [failure, setFailure] = useState<string>();
  const navigate = useNavigate();

  const login = async (params: LoginParamsProps): Promise<void> => {
    return await fetch(urlBuilder('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
      .then((response) => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((auth) => {
        if (auth.access_token) {
          localStorage.setItem('auth', JSON.stringify(auth));
          setIsLoggedIn(true);
        }
        if (!!auth.ok && auth.error) {
          setFailure(auth.error as string);
        }
      })
      .catch(() => {
        throw new Error('Network error');
      });
  };

  const checkError = (error: any): Promise<void> => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('auth');
      return Promise.reject(navigate('/admin/login'));
    }
    // other error code (404, 500, etc): no need to log out
    return Promise.resolve();
  };

  const checkAuth = (): Promise<void> =>
    localStorage.getItem('auth')
      ? Promise.resolve()
      : Promise.reject({ message: 'login.required' });

  const logOut = (): Promise<void> => {
    localStorage.removeItem('auth');
    setIsLoggedIn(false);
    navigate('/admin', { replace: true });
    return Promise.resolve();
  };

  const getIdentity = (): Promise<IdentityProps> => {
    try {
      const decoded = jwt_decode(localStorage.getItem('auth') as string);
      return Promise.resolve(decoded as IdentityProps);
    } catch (error) {
      return Promise.reject(error);
    }
  };
  const getPermissions = () => Promise.resolve();

  useEffect(() => {
    checkAuth().then((result) => {
      setIsLoggedIn(result === undefined);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        failure,
        isLoggedIn,
        login,
        checkAuth,
        checkError,
        logOut,
        getIdentity,
        getPermissions,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
