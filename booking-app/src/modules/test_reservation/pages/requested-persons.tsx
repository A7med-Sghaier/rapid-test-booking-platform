/*************************************************************
 * booking-app - requested-persons.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 22.01.22 - 23:01
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect } from 'react';
import { BookingContext } from '../contexts/appointment/booking-context';
import { useNavigate, useParams } from 'react-router-dom';
import { BookingSteps } from './registration';

export const RequestedPersons: React.FC = ({ children }) => {
  const { persons: reqPersons } = useParams();
  const { persons, setPersons, setTestType } = useContext(BookingContext);
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/reservation/' + BookingSteps.ADD_PERSONS);
  }, [persons]);

  useEffect(() => {
    if (reqPersons) {
      const personsData = JSON.parse(decodeURI(atob(reqPersons)));
      setPersons(personsData);
    }
  }, []);

  return <></>;
};
