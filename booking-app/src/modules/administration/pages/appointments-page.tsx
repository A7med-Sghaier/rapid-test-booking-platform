/*************************************************************
 * booking-app - appointments-page.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 12.02.22 - 00:07
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Chip,
  Container,
  List,
  Paper,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { addDays, eachDayOfInterval, format, parse, parseISO } from 'date-fns';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { de } from 'date-fns/locale';
import { makeStyles } from '@mui/styles';
import { ThemeBlue } from '../../../themes/theme-blue';
import { TestData } from '../resources/interfaces';
import { AppointmentsContext } from '../contexts/appointments-context';
import { AppointmentCard } from '../components/cards/appointment/appointment-card';
import { DateRangePicker, LocalizationProvider } from '@mui/lab';

const useStyles = makeStyles({
  tabsRoot: {
    backgroundColor: ThemeBlue.primary.main,
    '& .MuiTabs-flexContainer': {
      justifyContent: 'space-around !important',
    },
    '& .MuiTabs-indicator': {
      height: '.22rem',
      backgroundColor: ThemeBlue.secondary.main,
    },
  },
  tab: {
    color: 'rgba(232,232,232,0.8)',
    '& .chip': {
      backgroundColor: '#b7babc',
      color: '#fff',
    },
    '&.active': {
      color: '#fff',
      backgroundColor: 'rgba(199,199,199,0.4)',
      fontWeight: 'bold',
      '& .chip': {
        backgroundColor: ThemeBlue.secondary.main,
        color: '#fff',
      },
    },
  },

  groupTitle: {
    width: '12rem',
  },
  groupTitleLine: {
    borderTop: '2px solid rgba(229,229,229,0.5)',
    color: 'rgba(229,229,229,0.94)',
  },
});

interface AppointmentGroupsProps {
  day: string;
  appointments: TestData[];
}

type AppointmentDateRange = [Date | null, Date | null];

interface AppointmentsPageProps {}
export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  children,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const appointmentsContainer = useRef<any>(null);
  const { dateFrom, setDateFrom, dateTo, setDateTo, appointments } =
    useContext(AppointmentsContext);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<string>(
    format(dateFrom, 'dd.MM.yyyy', { locale: de })
  );

  const [groupedAppointments, setGroupedAppointments] = useState<
    AppointmentGroupsProps[]
  >([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleTabClick = (sectionId: string) => {
    setSelectedDay(sectionId);
    if (appointmentsContainer.current) {
      const containerOffsetTop = appointmentsContainer.current.offsetTop;
      const sibleElmnt = document.getElementById(sectionId);
      if (sibleElmnt) {
        const scrollTo = sibleElmnt.offsetTop;
        if (scrollTo) {
          appointmentsContainer.current.scrollTo({
            top: scrollTo - (containerOffsetTop || 0),
            behavior: 'smooth',
          });
        }
      }
    }
  };

  const getDatesInterval = useCallback(() => {
    return eachDayOfInterval({ start: dateFrom, end: dateTo }, { step: 1 });
  }, [dateFrom, dateTo]);

  const getDaysAfter = (date: Date | null, amount: number) => {
    return date ? addDays(date, amount) : undefined;
  };

  const handleRrangeChange = (dateRange: AppointmentDateRange) => {
    setDateFrom(dateRange[0]);
    setDateTo(dateRange[1]);
  };

  useEffect(() => {
    const groups = appointments.reduce(
      (groups: AppointmentGroupsProps[], appointment) => {
        const day = format(parseISO(appointment.appointment), 'dd.MM.yyyy', {
          locale: de,
        });
        const findIdx = groups.findIndex((item) => item.day === day);
        if (findIdx >= 0) {
          groups[findIdx].appointments.push(appointment);
        } else {
          groups.push({ day, appointments: [appointment] });
        }
        return groups;
      },
      []
    );
    setGroupedAppointments(groups);
  }, [appointments]);

  return (
    <Container maxWidth={false} className={clsx('h-100 d-flex flex-column')}>
      <Box className={clsx('my-4')}>
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={de}>
          <DateRangePicker
            //disablePast
            maxDate={getDaysAfter(dateFrom, 6)}
            mask="__.__.____"
            calendars={2}
            value={[dateFrom, dateTo]}
            onChange={(newValue: AppointmentDateRange) => {
              handleRrangeChange(newValue);
            }}
            renderInput={(startProps: any, endProps: any) => {
              startProps.label = t('dateRange.startDate');
              endProps.label = t('dateRange.endDate');
              return (
                <Box
                  className={clsx(
                    'w-100 justify-content-center d-flex align-items-end'
                  )}>
                  <TextField
                    className={clsx('col-3')}
                    variant="standard"
                    label="ffff"
                    {...startProps}
                  />
                  <Box sx={{ mx: 2 }}> {t('form.to')}</Box>
                  <TextField
                    className={clsx('col-3')}
                    variant="standard"
                    {...endProps}
                  />
                </Box>
              );
            }}
          />
        </LocalizationProvider>
      </Box>
      <Paper className={clsx('mt-2')} elevation={2}>
        <Tabs
          value={selectedTab}
          className={clsx(classes.tabsRoot)}
          onChange={handleTabChange}
          centered>
          {getDatesInterval().map((day, idx) => {
            const dayOfWeek: string = format(day, 'EEEE', { locale: de });
            const dateString: string = format(day, 'dd.MM.yyyy', {
              locale: de,
            });
            const groupCount =
              groupedAppointments.find((item) => item.day === dateString)
                ?.appointments.length ?? 0;
            return (
              <Tab
                key={`day-${format(day, 'dd.MM.yyyy', { locale: de })}`}
                className={clsx(
                  classes.tab,
                  selectedTab === idx ? 'active' : ''
                )}
                onClick={() => {
                  handleTabClick(dateString);
                }}
                label={
                  <Box className={clsx('d-flex  align-items-center')}>
                    <Box className={clsx('d-flex flex-column gap-1')}>
                      <Box className={clsx('fw-bold')}>{dayOfWeek}</Box>
                      <Box
                        className={clsx('fw-bold')}
                        sx={{ fontSize: '0.7rem' }}>
                        {dateString}
                      </Box>
                    </Box>
                    <Chip className={clsx('chip ms-2')} label={groupCount} />
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Paper>
      <Paper
        ref={appointmentsContainer}
        className={clsx(
          'flex-grow-1 d-flex flex-column my-1 pt-3 overflow-scroll'
        )}
        elevation={2}>
        {groupedAppointments
          .filter((group) => group.day === selectedDay)
          .map((group) => {
            const day = group.day;
            const title = format(
              parse(group.day, 'dd.MM.yyyy', new Date()),
              'EEEE, dd.MM.yyyy',
              {
                locale: de,
              }
            );
            return (
              <Box key={`appointment-group-${day}`} className={clsx('')}>
                <Box
                  id={group.day}
                  className={clsx(
                    'w-100 d-none d-flex align-items-center gap-3 px-3'
                  )}>
                  <Box
                    className={clsx(classes.groupTitle, 'fw-bold text-start')}>
                    {title}
                  </Box>
                  <Box
                    className={clsx(classes.groupTitleLine, 'flex-grow-1')}
                  />
                </Box>
                <List className={clsx('w-100 d-flex flex-wrap my-1 px-3')}>
                  {group.appointments.map((appointment) => (
                    <Box
                      className={clsx(
                        'col-10 col-sm-6 col-lg-4 col-xl-3 px-2 py-3'
                      )}
                      key={`person-${appointment.person.uid}`}>
                      <AppointmentCard testData={appointment} />
                    </Box>
                  ))}
                </List>
              </Box>
            );
          })}
      </Paper>
    </Container>
  );
};
