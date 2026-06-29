/*************************************************************
 * booking-app - yeta-header.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 26.01.22 - 19:41
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React from 'react';
import clsx from 'clsx';
import { Box } from '@mui/material';
import { ThemeBlue } from '../../themes/theme-blue';

interface YetaHeaderProps {
  bg?: string;
  color?: string;
}
export const YetaHeader: React.FC<YetaHeaderProps> = ({
  children,
  bg = '#FF931E',
  color,
}) => {
  return (
    <Box
      className={clsx(
        'w-100 d-flex flex-column justify-content-center align-items-center'
      )}>
      <Box
        className={clsx(
          'text-white rounded-circle fw-bold d-flex  justify-content-center align-items-center'
        )}
        sx={{
          width: '3rem',
          height: '3rem',
          backgroundColor: bg || ThemeBlue.primary.main,
          fontSize: '1.8rem',
        }}>
        Y
      </Box>
      <Box
        className={clsx('text-uppercase fw-bold')}
        sx={{ fontSize: '1.3rem ', color: color || '#fff' }}>
        Yeta.app
      </Box>
    </Box>
  );
};
