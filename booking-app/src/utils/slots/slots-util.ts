/*************************************************************
 * booking-app - slots.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 16.01.22 - 11:05
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import {
  addDays,
  addMinutes,
  compareAsc,
  eachMinuteOfInterval,
  format,
  getDate,
  getMonth,
  getYear,
  parseISO,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { urlBuilder } from '../http/http-utils';
import { TestData } from '../../modules/administration/resources/interfaces';

export interface SlotProps {
  date: Date;
  timeSlots: Date[];
}

export const getBookedSlots = (): Promise<any[]> => {
  return fetch(urlBuilder('/book-test-appointment/booked-slots'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
};

export const buildSlots = (
  slotsNbr: number,
  slotsValidator: any,
  timeFilter: { bookedSlots: any[]; maxCountProSlot: number }
): SlotProps[] => {
  return Array.from(Array(slotsNbr)).reduce((dateSlots, _) => {
    const currentDate = dateSlots.length
      ? addDays(dateSlots[dateSlots.length - 1].date, 1)
      : new Date();

    const createdDateSlot = !Object.keys(slotsValidator).length
      ? { date: currentDate }
      : createDateSlot(currentDate, slotsValidator);

    dateSlots.push({
      ...createdDateSlot,
      timeSlots: createTimeSlots(
        createdDateSlot.date,
        slotsValidator,
        timeFilter
      ),
    });
    return dateSlots;
  }, []);
};

const createDateSlot = (date: Date, slotsValidator: any): { date: Date } => {
  if (testSlotDateValidation(date, slotsValidator)) {
    return { date };
  }
  return createDateSlot(addDays(date, 1), slotsValidator);
};

const createTimeSlots = (
  date: Date,
  slotsValidator: any,
  timeFilter: { bookedSlots: any[]; maxCountProSlot: number }
) => {
  const dayKey = format(date, 'EEEEEE', { locale: enUS });

  if (slotsValidator[dayKey] && !slotsValidator[dayKey].from) {
    slotsValidator[dayKey].from = '06:00';
  }
  if (slotsValidator[dayKey] && !slotsValidator[dayKey].to) {
    slotsValidator[dayKey].to = '20:00';
  }

  const [currHr, currMin] = format(addMinutes(date, 10), 'HH:mm').split(':');
  let [fromHr, fromMin] = slotsValidator[dayKey].from.split(':');
  const [toHr, toMin] = slotsValidator[dayKey].to.split(':');

  if (compareAsc(new Date(), date) === 0) {
    if (fromHr < currHr || (fromHr === currHr && fromMin < currMin)) {
      fromMin = ((parseInt((parseInt(currMin) / 10).toString()) + 1) % 6) * 10;
      fromHr = parseInt(currHr);
    }
  }

  const dateBookedSlots = timeFilter.bookedSlots.filter((bookedSlot) => {
    const bookedDate = new Date(parseISO(bookedSlot.appointment));
    const clonedDate = new Date(date);
    bookedDate.setHours(0);
    bookedDate.setMinutes(0);
    bookedDate.setSeconds(0);
    bookedDate.setMilliseconds(0);
    clonedDate.setHours(0);
    clonedDate.setMinutes(0);
    clonedDate.setSeconds(0);
    clonedDate.setMilliseconds(0);
    return compareAsc(bookedDate, clonedDate) === 0;
  });

  return eachMinuteOfInterval(
    {
      start: new Date(
        getYear(date),
        getMonth(date),
        getDate(date),
        fromHr,
        fromMin
      ),
      end: new Date(getYear(date), getMonth(date), getDate(date), toHr, toMin),
    },
    { step: 10 }
  ).filter((slot) => {
    const equivalentBookedSlot = dateBookedSlots.find(
      (item) => compareAsc(slot, parseISO(item.appointment)) === 0
    );
    if (equivalentBookedSlot) {
      return equivalentBookedSlot.personsCount < timeFilter.maxCountProSlot;
    }
    return true;
  });
};

const testSlotDateValidation = (date: Date, slotsValidator: any) => {
  const dayKey = format(date, 'EEEEEE', { locale: enUS });
  if (!slotsValidator[dayKey] || !slotsValidator[dayKey].isOpen) {
    return false;
  }

  if (compareAsc(date, new Date()) === 1) {
    return true;
  }

  const [currHr, currMin] = format(addMinutes(date, 10), 'HH:mm').split(':');
  const [toHour, ToMinutes] = slotsValidator[dayKey].to.split(':');
  return currHr < toHour || (currHr == toHour && currMin < ToMinutes);
};
