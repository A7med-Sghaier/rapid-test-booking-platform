/*************************************************************
 * booking-app - slots-list.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 17.01.22 - 08:30
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useState } from 'react';
import { AppointmentSlotsContext } from '../../modules/test_reservation/contexts/appointment/appointment-slots-context';
import { Box } from '@mui/material';
import { SlotDate } from '../appointment/slot-date';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ColorButton } from '../buttons/buttons';
import { GlobalAppContext } from '../../contexts/global-app-context';

interface SlotsList {
  onSelect: () => void;
}

export const SlotsList: React.FC<SlotsList> = ({ onSelect }) => {
  const { t } = useTranslation();
  const [expandedSlot, setExpandedSlot] = useState(0);
  const { dateSlots, canAddDateSlots, addDateSlots } = useContext(
    AppointmentSlotsContext
  );

  const handleSlotExpand = (slotIdx: number) => {
    setExpandedSlot(slotIdx === expandedSlot ? -1 : slotIdx);
  };

  return (
    <Box className={clsx('p-2 p-md-5 mx-md-5')}>
      {dateSlots.map((slotDate, idx) => (
        <SlotDate
          key={`date-slot-${idx}`}
          onChange={handleSlotExpand}
          onSelect={onSelect}
          slotIdx={idx}
          slotDate={slotDate}
          expanded={expandedSlot === idx}
        />
      ))}
      <Box mt={4} display="flex" justifyContent="center">
        <ColorButton
          variant="contained"
          onClick={addDateSlots}
          disabled={canAddDateSlots() ? false : true}>
          {t('global.addMore')}
        </ColorButton>
      </Box>
    </Box>
  );
};
