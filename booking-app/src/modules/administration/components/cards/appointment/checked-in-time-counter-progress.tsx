/*************************************************************
 * booking-app - checked-in-time-counter-progress.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 01.02.22 - 23:00
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, CircularProgressProps } from '@mui/material';
import clsx from 'clsx';
import { differenceInSeconds } from 'date-fns';

interface TimeCounterProgressProps {
  checkinDate: Date;
}

export const CheckedInTimeCounterProgress: React.FC<
  TimeCounterProgressProps
> = ({ children, checkinDate }) => {
  const [restTime, setRestTime] = useState(0);
  useEffect(() => {
    if (restTime < 1200) {
      const timer = setInterval(() => {
        const diff = differenceInSeconds(new Date(), checkinDate);
        setRestTime(diff);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [restTime]);

  if (restTime >= 1200) {
    return <></>;
  }

  return (
    <Box
      className={clsx(
        'd-flex justify-content-center align-items-center position-absolute top-0 start-0 bottom-0 end-0'
      )}>
      <Box
        className={clsx(
          'position-absolute bg-secondary top-0 start-0 bottom-0 end-0'
        )}
        sx={{ opacity: '.7', zIndex: '12' }}
      />
      <Box className={clsx('position-relative')} sx={{ zIndex: '14' }}>
        <svg
          className="pie"
          style={{
            transform: 'rotate(-90deg)',
            width: '5rem',
            height: '5rem',
          }}>
          <circle r="50%" cx="50%" cy="50%" className="circle" />
          <circle
            id="pie"
            r="22.5%"
            cx="50%"
            cy="50%"
            className="circle "
            style={{
              strokeDasharray: `${restTime / 12} 1200`,
              opacity: 1,
            }}
          />
        </svg>
        <Box
          className={clsx(
            'd-flex justify-content-center align-items-center position-absolute text-white top-0 start-0 bottom-0 end-0'
          )}
          sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          {`${('0' + Math.floor(restTime / 60)).slice(-2)}:${(
            '0' +
            (restTime % 60)
          ).slice(-2)}`}
        </Box>
      </Box>
    </Box>
  );
};

/**
 *
 * <circle
 *             r="25%"
 *             cx="50%"
 *             cy="50%"
 *             style={{
 *               strokeDasharray: `${(restTime / 20) * 141} 141`,
 *               opacity: 1,
 *             }}
 *           />
 *
 * <Box className={clsx('position-relative d-inline-flex')}>
 *       <CircularProgress variant="determinate" {...progress} />
 *       <Box
 *         sx={{
 *           top: 0,
 *           left: 0,
 *           bottom: 0,
 *           right: 0,
 *           position: 'absolute',
 *           display: 'flex',
 *           alignItems: 'center',
 *           justifyContent: 'center',
 *         }}>
 *         <Box color="text.secondary">{restTime}</Box>
 *       </Box>
 *     </Box>
 */
