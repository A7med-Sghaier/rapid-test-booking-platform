/*************************************************************
 * booking-app - slot-date.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 16.01.22 - 00:16
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { SlotProps } from '../../utils/slots/slots-util';
import { SlotTime } from './slot-time';
import clsx from 'clsx';
import { ColorButton } from '../buttons/buttons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@mui/styles';
import { GlobalAppContext } from '../../contexts/global-app-context';
import { AppointmentSlotsContext } from '../../modules/test_reservation/contexts/appointment/appointment-slots-context';
import { BookingContext } from '../../modules/test_reservation/contexts/appointment/booking-context';

const useStyles = makeStyles({
  summary: {
    minHeight: '2rem !important',
    '& .Mui-expanded': {
      margin: '10px 0',
    },
    '& .Mui-MuiAccordionSummary-contentGutters:not(.Mui-expanded)': {
      margin: '10px 0',
    },
  },
});

interface SlotDateProps {
  slotDate: SlotProps;
  slotIdx: number;
  expanded: boolean;
  onChange: (slotIdx: number) => void;
  onSelect: () => void;
}
export const SlotDate: React.FC<SlotDateProps> = ({
  slotDate,
  slotIdx,
  expanded,
  onChange,
  onSelect,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [timeSlotsCount, setTimeSlotsCount] = useState(12);
  const [canShowMore, setCanShowMore] = useState(
    timeSlotsCount < slotDate.timeSlots.length
  );

  const showMoreSlots = () => {
    if (
      slotDate.timeSlots.length &&
      timeSlotsCount < slotDate.timeSlots.length
    ) {
      const timeSlotsLength = slotDate.timeSlots.length;
      let newSlotsCount = timeSlotsCount + 12;
      if (newSlotsCount > timeSlotsLength) {
        newSlotsCount = timeSlotsCount + (timeSlotsLength - timeSlotsCount);
      }
      setTimeSlotsCount(newSlotsCount);
    }
  };

  useEffect(() => {
    setCanShowMore(timeSlotsCount < slotDate.timeSlots.length);
  }, [timeSlotsCount]);

  return (
    <Accordion
      expanded={expanded}
      onChange={() => onChange(slotIdx)}
      TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary
        className={clsx(classes.summary)}
        sx={{ minHeight: '2rem !important' }}
        expandIcon={<ExpandMoreIcon />}>
        <Typography>{format(slotDate.date, 'PPPP', { locale: de })}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box className={clsx(' d-flex flex-wrap')}>
          {slotDate.timeSlots.slice(0, timeSlotsCount).map((slotTime) => (
            <Box
              key={`slot-time-${format(slotTime, 'dd-MM-yyyy-HH:mm')}`}
              className={clsx('col-3 col-md-2  mt-2')}>
              <SlotTime onSelect={onSelect} date={slotTime} />
            </Box>
          ))}
        </Box>
        <Box mt={4} display="flex" justifyContent="center">
          <ColorButton
            variant="contained"
            onClick={showMoreSlots}
            disabled={!canShowMore}>
            {t('global.addMore')}
          </ColorButton>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
