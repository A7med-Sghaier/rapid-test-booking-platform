/*************************************************************
 * booking-app - appointment-slots-context.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 16.01.22 - 10:38
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { compareAsc, parseISO } from 'date-fns';
import {
  buildSlots,
  getBookedSlots,
  SlotProps,
} from '../../../../utils/slots/slots-util';
import { GlobalAppContext } from '../../../../contexts/global-app-context';
import { BookingContext } from './booking-context';

interface AppointmentSlotsProps {
  dateSlots: SlotProps[];
  addDateSlots: () => void;
  canAddDateSlots: () => boolean;
  bookedSlots: any[];
}

export const AppointmentSlotsContext =
  React.createContext<AppointmentSlotsProps>({
    dateSlots: [],
    canAddDateSlots: () => false,
    addDateSlots: () => {},
    bookedSlots: [],
  });

export const AppointmentSlotsProvider: React.FC = ({ children }) => {
  const maxDateSlotsCount = 15;
  const [dateSlotsCount, setDateSlotsCount] = useState(5);
  const [availableTimeSlots, setAvailableTimeSlots] = useState();
  const [dateSlots, setDateSlots] = useState<SlotProps[]>([]);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const { center } = useContext(GlobalAppContext);
  const addDateSlots = () => {
    if (dateSlotsCount < maxDateSlotsCount) {
      setDateSlotsCount(dateSlotsCount + 5);
    }
  };

  const canAddDateSlots = useCallback(() => {
    return dateSlotsCount < maxDateSlotsCount;
  }, [dateSlotsCount]);

  useEffect(() => {
    if (availableTimeSlots) {
      setDateSlots(
        buildSlots(dateSlotsCount, availableTimeSlots, {
          bookedSlots,
          maxCountProSlot: center?.maxPerSlot ?? 5,
        })
      );
    }
  }, [dateSlotsCount, availableTimeSlots, bookedSlots]);

  useEffect(() => {
    if (center && center.openingTimes) {
      setAvailableTimeSlots(center.openingTimes);
    }
  }, [center]);

  useEffect(() => {
    getBookedSlots().then((data) => {
      setBookedSlots(data);
    });
  }, []);

  return (
    <AppointmentSlotsContext.Provider
      value={{ dateSlots, bookedSlots, addDateSlots, canAddDateSlots }}>
      {children}
    </AppointmentSlotsContext.Provider>
  );
};
