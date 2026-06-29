/*************************************************************
 * booking-app - use-token.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 21.01.22 - 22:16
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useToken() {
  const getToken = () =>
    AsyncStorage.getItem(process.env.REACT_APP_TOKEN_NAME as string);

  const [token, setToken] = useState<string | null>();

  useEffect(() => {
    getToken().then((newToken: string | null) => {
      setToken(newToken);
    });
  }, []);

  const saveToken = (userToken: any) => {
    AsyncStorage.setItem(
      process.env.REACT_APP_TOKEN_NAME as string,
      userToken.access_token
    );
    setToken(userToken.access_token);
  };

  return {
    setToken: saveToken,
    token,
  };
}
