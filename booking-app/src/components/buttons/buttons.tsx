/*************************************************************
 * booking-app - buttons.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 17.01.22 - 14:34
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { styled } from '@mui/material/styles';
import { Button, ButtonProps } from '@mui/material';
import { ThemeBlue } from '../../themes/theme-blue';

export const ColorButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: '#fff',
  backgroundColor: ThemeBlue.primary.main,

  //color: theme.palette.getContrastText(purple[500]),
  //backgroundColor: purple[500],
  '&:hover': {
    backgroundColor: ThemeBlue.secondary.light,
    color: 'rgba(65,64,64,0.7)',
    //color: '#000',
  },
  '&.selected': {
    backgroundColor: ThemeBlue.secondary.main,
  },

  '&:disabled': {
    backgroundColor: 'rgba(199,199,199,0.71)',
    color: 'rgba(159,159,159,0.82)',
  },
  '& a': {
    textDecoration: 'none',
    color: '#fff',
    '&:hover': {
      color: 'rgba(65,64,64,0.7)',
    },
  },
}));
