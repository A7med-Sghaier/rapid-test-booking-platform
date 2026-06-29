/*************************************************************
 * booking-app - dashboard-page.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 11.02.22 - 12:51
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useMemo } from 'react';
import { Box, Container } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import clsx from 'clsx';
import { StatisticsContext } from '../contexts/statistics-context';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      position: 'bottom' as const,
    },
    title: {
      display: false,
      text: '',
    },
  },
};

const initialData: ChartData<'line', any[], string> = {
  labels: [],
  datasets: [
    {
      label: 'statisticsByDate',
      data: [],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
  ],
};

interface DashboardPageProps {}
export const DashboardPage: React.FC<DashboardPageProps> = ({ children }) => {
  const { appointmentStatisticsByDate: countsByDate } =
    useContext(StatisticsContext);

  const chartData = useMemo(() => {
    return countsByDate?.reduce((data, item) => {
      if (!!item.date && !!item.count) {
        data.labels?.push(item.date as string);
        data.datasets[0].data.push(item.count);
      }
      return data;
    }, JSON.parse(JSON.stringify(initialData)));
  }, [countsByDate]);

  return (
    <Container className={clsx('h-100 d-flex flex-column')} maxWidth={false}>
      <Box className={clsx('fw-bold')} sx={{ fontSize: '3rem' }}>
        Dashboard
      </Box>
      <Box className={clsx('px-4 my-auto')} sx={{ height: '20rem' }}>
        {chartData && <Line options={options} data={chartData} />}
      </Box>
    </Container>
  );
};
