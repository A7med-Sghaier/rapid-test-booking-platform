/*************************************************************
 * booking-app - new-appointment-dialog.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 06.02.22 - 19:48
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { Form } from '../../../../../components/forms/form';
import clsx from 'clsx';
import { Skeleton } from '@mui/lab';
import { ColorButton } from '../../../../../components/buttons/buttons';
import { DataFormContext } from '../../../../../contexts/forms/data-form-context';
import { useTranslation } from 'react-i18next';
import { createBooking } from '../../../../../utils/global/bookin-utils';
import { BookingProps } from '../../../../../interfaces/booking-interface';
import { AuthContext } from '../../../../../contexts/auth/auth-context';
import { NewAppointmentForm } from '../../../resources/forms/new-appointment-form';
import { GlobalAppContext } from '../../../../../contexts/global-app-context';
import { ClientsContext } from '../../../contexts/clients-context';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  BookingPersonProps,
  PersonProps,
} from '../../../../test_reservation/contexts/appointment/booking-context';

interface NewAppointmentDialogProps {
  openNewAppointmentForm: boolean;
  openDialog: (open: boolean) => void;
}

const NewAppointmentDialog: React.FC<NewAppointmentDialogProps> = ({
  children,
  openDialog,
  openNewAppointmentForm,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { getIdentity } = useContext(AuthContext);
  const { center } = useContext(GlobalAppContext);
  const { clients } = useContext(ClientsContext);
  const appointmentForm = NewAppointmentForm;
  const [defaultFormValues, setDeFaultFormValues] = React.useState<
    BookingPersonProps | undefined
  >();

  const { formValues, cleanForm, checkFormValidation, setFormTemplate } =
    useContext(DataFormContext);

  const handleSave = () => {
    setIsLoading(true);
    const testType = formValues.testType;
    const persons = { ...formValues };
    delete persons['testType'];
    getIdentity().then((identity) => {
      createBooking({
        testType,
        appointment: new Date(),
        persons: [persons],
        yetaPolicyAccepted: true,
        pocPolicyAccepted: true,
        createdBy: identity.id,
      } as BookingProps).then(() => {
        setIsLoading(false);
        setDeFaultFormValues(undefined);
        cleanForm();
        openDialog(false);
      });
    });
  };

  const handleCancel = () => {
    setDeFaultFormValues(undefined);
    cleanForm();
    openDialog(false);
  };

  const getClients = useCallback(() => {
    return {
      options: [...clients],
      getOptionLabel: (option: any) =>
        option.firstName +
        ' ' +
        option.secondName +
        ', ' +
        format(parseISO(option.birthDate), 'dd.MM.yyyy', { locale: de }),
    };
  }, [clients]);

  const handleClientChange = (client: BookingPersonProps | null) => {
    if (client) {
      setDeFaultFormValues(client);
    }
  };

  useEffect(() => {
    setFormTemplate(NewAppointmentForm);
    if (!center) return;
    const testTypeField = appointmentForm.fields.find(
      (field) => field.key === 'testType'
    );
    if (testTypeField) {
      const tests = center
        ? center.testTypes.filter((test) => !!test.isActive)
        : [];
      testTypeField.items.options = tests;
      testTypeField.defaultValue = tests.length
        ? JSON.stringify(tests[0])
        : undefined;
    }
  }, [center]);

  useEffect(() => {
    setFormTemplate(NewAppointmentForm);
  }, []);

  return (
    <Dialog
      open={openNewAppointmentForm}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description">
      <DialogTitle id="scroll-dialog-title" className={clsx('py-2')}>
        {t('admin.addAppointment')}
      </DialogTitle>
      <DialogContent dividers className={clsx('pt-1')}>
        <Box className={clsx('w-100 px-4 mb-4')}>
          <Autocomplete
            {...getClients()}
            id="include-input-in-list"
            includeInputInList
            onChange={(event: any, newValue: BookingPersonProps | null) => {
              handleClientChange(newValue);
            }}
            renderInput={(params) => (
              <TextField
                className={clsx('pt-0')}
                {...params}
                label="includeInputInList"
                variant="standard"
              />
            )}
          />
        </Box>
        <Form form={appointmentForm} defaultValues={defaultFormValues} />
        {isLoading && (
          <Box
            className={clsx(
              'w-100 h-100 position-absolute start-0 top-0 d-flex justify-content-center align-items-center'
            )}
            sx={{ background: 'rgba(0, 0, 0, .6)', zIndex: 999 }}>
            <Box className={clsx('w-75')}>
              <Skeleton sx={{ background: 'rgba(149,149,149, .6)' }} />
              <Skeleton
                animation="wave"
                sx={{ background: 'rgba(149,149,149, .6)' }}
              />
              <Skeleton sx={{ background: 'rgba(149,149,149, .6)' }} />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <ColorButton
          disabled={isLoading}
          className={clsx('px-3')}
          onClick={handleCancel}
          sx={{ backgroundColor: 'rgba(193, 39, 40, .8)' }}>
          {t('global.cancel')}
        </ColorButton>
        <ColorButton
          className={clsx('px-3')}
          onClick={handleSave}
          disabled={!checkFormValidation() || isLoading}
          sx={{ backgroundColor: '#617c85' }}>
          {t('form.save')}
        </ColorButton>
      </DialogActions>
    </Dialog>
  );
};

export default memo(NewAppointmentDialog);
