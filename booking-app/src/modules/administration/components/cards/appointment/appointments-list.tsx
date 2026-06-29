/*************************************************************
 * booking-app - appointments-list.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 27.01.22 - 22:25
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import clsx from 'clsx';
import { TodayFilterForm } from '../../../resources/forms/today-filter-form';
import { Form } from '../../../../../components/forms/form';
import { DataFormContext } from '../../../../../contexts/forms/data-form-context';
import { format, parse, parseISO } from 'date-fns';
import { TestData } from '../../../resources/interfaces';
import { APPOINTMENT_STATUS } from '../../../../test_reservation/contexts/appointment/booking-context';

interface AppointmentsListProps {
  appointments: TestData[];
  type: APPOINTMENT_STATUS;
  ItemsType?: any;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({
  children,
  appointments = [],
  type,
  ItemsType,
}) => {
  const [filteredData, setFilteredData] = useState<TestData[]>([]);
  const { formValues } = useContext(DataFormContext);

  const getFilteredPersons = (items: TestData[], searchVal: string) => {
    if (searchVal) {
      return items.filter((item) => {
        return (
          !!item.person &&
          ([item.person.firstName, item.person.secondName]
            .join(' ')
            .toLocaleUpperCase()
            .includes(searchVal) ||
            item.person.email?.includes(searchVal) ||
            format(
              parseISO(item.person.birthDate as string),
              'dd.MM.yyyy'
            ).includes(searchVal))
        );
      });
    }
    return items;
  };

  const getFilterByResult = (items: TestData[], result: string) => {
    if (result) {
      return items.filter((item) => {
        if (item.person.status === 'testPerformed') {
          return item.person.testResult === result;
        }
        return true;
      });
    }
    return items;
  };

  useEffect(() => {
    let searchVal = formValues['today-search-all-field'];
    const testResult = formValues['test-results'];
    if (searchVal) {
      searchVal = searchVal.toLocaleUpperCase();
    }
    setFilteredData(
      getFilterByResult(
        getFilteredPersons([...appointments], searchVal),
        testResult
      )
    );
  }, [formValues, appointments]);

  useEffect(() => {
    setFilteredData(appointments);
  }, [appointments]);

  return (
    <Box>
      <Form form={TodayFilterForm} excludeOptions={{ appointmentType: type }} />
      <Box className={clsx('flex pt-4 px-3 d-flex flex-wrap')}>
        {filteredData.map((test) => (
          <Box
            key={`appointment-${test._id}-${test.person.uid}`}
            className={clsx(
              'd-flex flex-column col-10 col-sm-6 col-lg-4 col-xl-3 px-2 py-3'
            )}>
            {!!ItemsType && <ItemsType testData={test} />}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
