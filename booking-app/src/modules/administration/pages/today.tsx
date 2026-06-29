/*************************************************************
 * booking-app - today.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 26.01.22 - 22:59
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useState } from 'react';
import { Box, Chip, Container, Paper, Tab, Tabs } from '@mui/material';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { makeStyles } from '@mui/styles';
import { AppointmentsList } from '../components/cards/appointment/appointments-list';
import { TodayAppointmentsContext } from '../contexts/today-appointments-context';
import { TodayAppointmentCard } from '../components/cards/appointment/today-appointment-card';
import { CheckedInCard } from '../components/cards/appointment/checked-in-card';
import { CompletedTestCard } from '../components/cards/appointment/completed-test-card';
import { TestData } from '../resources/interfaces';
import { APPOINTMENT_STATUS } from '../../test_reservation/contexts/appointment/booking-context';
import { ThemeBlue } from '../../../themes/theme-blue';

const useStyles = makeStyles({
  tabsRoot: {
    backgroundColor: ThemeBlue.primary.main,
    '& .MuiTabs-flexContainer': {
      justifyContent: 'space-around !important',
    },
    '& .MuiTabs-indicator': {
      height: '.22rem',
      //backgroundColor: '#e1b200',
      backgroundColor: ThemeBlue.secondary.main,
    },
  },
  tab: {
    //color: '#fff',
    color: 'rgba(232,232,232,0.8)',
    '& .chip': {
      backgroundColor: '#b7babc',
      color: '#fff',
    },
    '&.active': {
      //color: '#e1b200',
      color: '#fff',
      backgroundColor: 'rgba(199,199,199,0.4)',
      fontWeight: 'bold',
      '& .chip': {
        //backgroundColor: '#d7cd56e6',
        backgroundColor: ThemeBlue.secondary.main,
        color: '#fff',
      },
    },
  },
});

export const Today: React.FC = ({ children }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const { appointments } = useContext(TodayAppointmentsContext);
  const [todayAppointments, setTodayAppointments] = useState<TestData[]>([]);
  const [checkedIn, setCheckedIn] = useState<TestData[]>([]);
  const [completed, setCompleted] = useState<TestData[]>([]);

  useEffect(() => {
    setTodayAppointments(
      appointments.filter(
        (appointment) =>
          !appointment.person.status ||
          appointment.person.status === APPOINTMENT_STATUS.WAITING
      )
    );

    setCheckedIn(
      appointments.filter(
        (appointment) =>
          appointment.person.status === APPOINTMENT_STATUS.CHECKED_IN
      )
    );

    setCompleted(
      appointments.filter(
        (appointment) =>
          appointment.person.status === APPOINTMENT_STATUS.TEST_PERFORMED
      )
    );
  }, [appointments]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Container
      maxWidth={false}
      className={clsx('h-100 d-flex flex-column mt-3 px-4 m-0')}>
      <Box className={clsx('pb-2 d-flex flex-column')} sx={{ opacity: '.5' }}>
        <Box
          className={clsx('text-uppercase fw-bold')}
          sx={{ fontSize: '1.6rem' }}>
          {t('admin.today')}
        </Box>
        <Box
          className={clsx('text-uppercase text-decoration-underline fw-bold')}>
          {format(new Date(), 'PPPP', { locale: de })}
        </Box>
      </Box>
      <Paper elevation={2}>
        <Tabs
          className={clsx(classes.tabsRoot)}
          value={selectedTab}
          onChange={handleTabChange}
          centered>
          <Tab
            className={clsx(classes.tab, selectedTab === 0 ? 'active' : '')}
            label={
              <Box className={clsx('d-flex align-items-center')}>
                <Box>{t('admin.appointments')}</Box>
                <Chip
                  className={clsx('chip ms-2')}
                  label={todayAppointments.length}
                />
              </Box>
            }
          />
          <Tab
            className={clsx(classes.tab, selectedTab === 1 ? 'active' : '')}
            label={
              <Box className={clsx('d-flex align-items-center')}>
                {t('admin.setResult')}
                <Chip className={clsx('chip ms-2')} label={checkedIn.length} />
              </Box>
            }
          />
          <Tab
            className={clsx(classes.tab, selectedTab === 2 ? 'active' : '')}
            label={
              <Box className={clsx('d-flex align-items-center')}>
                {t('admin.results')}
                <Chip className={clsx('chip ms-2')} label={completed.length} />
              </Box>
            }
          />
        </Tabs>
      </Paper>
      <Paper
        className={clsx('flex-grow-1 d-flex flex-column mt-1 pt-1')}
        elevation={2}>
        {selectedTab === 0 && (
          <AppointmentsList
            appointments={todayAppointments}
            type={APPOINTMENT_STATUS.WAITING}
            ItemsType={TodayAppointmentCard}
          />
        )}
        {selectedTab === 1 && (
          <AppointmentsList
            appointments={checkedIn}
            type={APPOINTMENT_STATUS.CHECKED_IN}
            ItemsType={CheckedInCard}
          />
        )}
        {selectedTab === 2 && (
          <AppointmentsList
            type={APPOINTMENT_STATUS.TEST_PERFORMED}
            appointments={completed}
            ItemsType={CompletedTestCard}
          />
        )}
      </Paper>
      <iframe className={clsx('d-none')} id="result-view" />
    </Container>
  );
};
