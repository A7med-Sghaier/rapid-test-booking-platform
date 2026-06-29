/*************************************************************
 * booking-app - settings-section.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 30.01.22 - 13:29
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from '@mui/material';
import clsx from 'clsx';
import { Form } from '../../../../components/forms/form';
import { FormProps } from 'react-bootstrap';
import { ColorButton } from '../../../../components/buttons/buttons';
import { useTranslation } from 'react-i18next';
import { DataFormContext } from '../../../../contexts/forms/data-form-context';
import { saveSettings } from '../../../../utils/global/settings-utils';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface SettingsSectionProps {
  id?: string;
  title: string;
  form: FormProps;
  values: any;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  children,
  form,
  title,
  values,
  id,
}) => {
  const { t } = useTranslation();
  const { formValues } = useContext(DataFormContext);
  const [openSection, setOpenSection] = useState<boolean>(true);
  const onSave = () => {
    saveSettings(formValues).then();
  };

  const isDirtyChange = useCallback(() => {
    if (values) {
      return Object.keys(formValues).some((key) => {
        return JSON.stringify(formValues[key]) !== JSON.stringify(values[key]);
      });
    }
    return false;
  }, [formValues, values]);

  return (
    <Box id={id}>
      <Accordion
        expanded={openSection}
        TransitionProps={{ unmountOnExit: true }}
        onChange={() => setOpenSection(!openSection)}>
        <AccordionSummary
          className={clsx('my-1')}
          expandIcon={<ExpandMoreIcon />}>
          <Box className={clsx('fw-bold')} sx={{ fontSize: '1.1rem' }}>
            {title}
          </Box>
        </AccordionSummary>
        <AccordionDetails className={clsx('bg-light')}>
          <Form form={form} defaultValues={values} />
          <Box className={clsx('mt-2 d-flex')}>
            <ColorButton onClick={onSave} disabled={!isDirtyChange()}>
              {t('form.save')}
            </ColorButton>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
