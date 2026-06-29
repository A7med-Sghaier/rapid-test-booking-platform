/*************************************************************
 * booking-app - test-persons.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 15.01.22 - 23:13
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useState } from 'react';
import { Box, Checkbox, Chip, Typography } from '@mui/material';
import { Form } from '../forms/form';
import {
  RegistrationForm,
  RegistrationFormAdditional,
} from '../../modules/test_reservation/resources/forms/booking-form';
import {
  BookingContext,
  PersonProps,
} from '../../modules/test_reservation/contexts/appointment/booking-context';
import { useTranslation } from 'react-i18next';
import { DataFormContext } from '../../contexts/forms/data-form-context';
import clsx from 'clsx';
import { ThemeBlue } from '../../themes/theme-blue';
import { ColorButton } from '../buttons/buttons';
import { PolicyDialog } from '../dialogs/policy-dialog';
import { createBooking } from '../../utils/global/bookin-utils';
import { BookingProps } from '../../interfaces/booking-interface';
import { useNavigate } from 'react-router-dom';
import { BookingSteps } from '../../modules/test_reservation/pages/registration';
import { Skeleton } from '@mui/lab';
interface TestPersonsProps {
  emitFormValidation: (valid: boolean) => void;
}
export const TestPersons: React.FC<TestPersonsProps> = ({
  emitFormValidation,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const {
    testType,
    appointment,
    persons,
    addPerson,
    updatePerson,
    removePerson,
    yetaPolicyAccepted,
    pocPolicyAccepted,
    setYetaPolicyAccepted,
    setPocPolicyAccepted,
  } = useContext(BookingContext);
  const [policyDialogTitle, setPolicyDialogTitle] = useState('');
  const [policyDialogContent, setPolicyDialogContent] = useState('');
  const [personsCount, setPersonsCount] = useState(1);
  const [openPolicy, setOpenPolicy] = React.useState(false);
  const [editPersonIdx, setEditPersonIdx] = React.useState<number | null>(null);
  const [defaultFormValues, setDeFaultFormValues] = React.useState<
    PersonProps | undefined
  >();

  const { formValues, checkFormValidation, setFormTemplate, cleanForm } =
    useContext(DataFormContext);

  const handleEditPerson = (idx: number, person: PersonProps) => {
    setDeFaultFormValues({ ...person });
    setEditPersonIdx(idx);
  };

  const handleDeletePerson = (idx: number) => {
    if (personsCount - 1 > 0) {
      setPersonsCount(personsCount - 1);
    }
    removePerson(idx);
  };

  const handleAddNewPerson = () => {
    setPersonsCount(personsCount + 1);
    if (persons.length) {
      let defaultValues = undefined;
      const copyPerson: PersonProps = { ...persons[0] };
      defaultValues = {
        address: copyPerson.address,
        city: copyPerson.city,
        postalCode: copyPerson.postalCode,
      };
      setDeFaultFormValues(defaultValues as PersonProps);
    }
  };

  const handleCancelEdit = () => {
    if (editPersonIdx === null && personsCount - 1 >= 1) {
      setPersonsCount(personsCount - 1);
    }
    setEditPersonIdx(null);
    cleanForm();
  };

  const handleSavePerson = () => {
    if (editPersonIdx === null) {
      if (formValues) {
        addPerson({ ...formValues } as PersonProps);
      }
    } else {
      updatePerson(editPersonIdx, { ...formValues } as PersonProps);
      setEditPersonIdx(null);
    }
    cleanForm();
  };

  const handleOpenPolicy = (type: string) => {
    switch (type) {
      case 'yeta':
        setPolicyDialogTitle(t('global.bookPolicy.word'));
        setPolicyDialogContent(t('global.bookPolicy.text'));
        //{t('global.bookPolicy.text')}
        break;
      case 'poc':
        setPolicyDialogTitle(t('global.pocAntigenPolicy.word'));
        setPolicyDialogContent(t('global.pocAntigenPolicy.text'));
        break;
    }
    setOpenPolicy(true);
  };

  const handleClosePolicy = () => {
    setOpenPolicy(false);
  };

  const bookAppointment = () => {
    setIsLoading(true);
    createBooking({
      testType,
      appointment,
      persons,
      yetaPolicyAccepted,
      pocPolicyAccepted,
    } as BookingProps).then((response) => {
      setIsLoading(false);
      if (!!response.ok && typeof response.data === 'string') {
        navigate('/booking-done', { state: { qr: response.data, persons } });
      }
    });
  };

  useEffect(() => {
    if (!!persons.length && personsCount === 1) {
      setPersonsCount(persons.length);
    }
  }, []);

  useEffect(() => {
    emitFormValidation(personsCount === persons.length);
    if (!persons.length) {
      cleanForm();
    }
  }, [personsCount, persons]);

  useEffect(() => {
    if (editPersonIdx === 0 || (editPersonIdx === null && personsCount === 1)) {
      setFormTemplate(RegistrationForm);
    }
    if (
      (editPersonIdx !== null && editPersonIdx > 0) ||
      (editPersonIdx === null && personsCount > 1)
    ) {
      setFormTemplate(RegistrationFormAdditional);
    }
  }, [editPersonIdx, personsCount]);

  return (
    <Box
      className={clsx(
        'registration-data h-100 d-flex flex-column align-items-center bg-white pt-md-3'
      )}>
      {(personsCount > persons.length || editPersonIdx !== null) && (
        <>
          {(!persons.length || editPersonIdx === 0) && (
            <Form defaultValues={defaultFormValues} form={RegistrationForm} />
          )}
          {((!!persons.length && editPersonIdx === null) ||
            (!!editPersonIdx && editPersonIdx > 0)) && (
            <Form
              defaultValues={defaultFormValues}
              form={RegistrationFormAdditional}
            />
          )}
          <Box className={clsx(' flex-grow-1')}>
            <Box
              className={clsx(
                'mt-4 pb-4 mt-md-5 d-flex justify-content-center '
              )}
              gap="1rem">
              {(editPersonIdx !== null || personsCount > 1) && (
                <ColorButton variant="contained" onClick={handleCancelEdit}>
                  {t('global.cancel')}
                </ColorButton>
              )}
              <ColorButton
                variant="contained"
                disabled={!checkFormValidation()}
                onClick={handleSavePerson}>
                {!persons.length || editPersonIdx !== null
                  ? t('global.savePerson')
                  : t('global.add')}
              </ColorButton>
            </Box>
          </Box>
        </>
      )}
      {personsCount === persons.length && editPersonIdx === null && (
        <Box
          className={clsx(
            'w-100 flex-grow-1 d-flex flex-column justify-content-around'
          )}>
          <Box
            className={clsx('p-1 d-flex justify-content-center flex-wrap')}
            gap="0.8rem">
            {persons.map((person, idx) => (
              <Chip
                className={clsx('fw-bold p-2')}
                sx={{
                  fontSize: '1rem',
                  background: ThemeBlue.warning.main,
                  color: '#fff',
                }}
                key={`person-chip-${person.firstName} ${person.secondName}`}
                label={`${person.firstName} ${person.secondName}`}
                onClick={() => handleEditPerson(idx, person)}
                onDelete={() => {
                  handleDeletePerson(idx);
                }}
              />
            ))}
          </Box>
          <Box className={clsx('mt-4 mt-md-5 ')}>
            <ColorButton variant="contained" onClick={handleAddNewPerson}>
              {t('global.addPerson')}
            </ColorButton>
          </Box>
        </Box>
      )}
      {!!testType &&
        !!appointment &&
        personsCount === persons.length &&
        editPersonIdx === null && (
          <Box className={clsx('d-flex flex-column gap-1 align-items-start')}>
            <Box
              className={clsx(
                'w-90 mt-4 mt-md-auto mb-md-4 px-3 px-md-5 d-flex justify-content-center align-items-start'
              )}>
              <Checkbox
                className={clsx('p-0')}
                sx={{ borderColor: ThemeBlue.primary.main }}
                checked={yetaPolicyAccepted}
                onChange={(evt) => {
                  setYetaPolicyAccepted(evt.target.checked);
                }}
              />
              <Box>
                <Typography
                  className={clsx(
                    'p-0 fs-md-6 text-start text-md-center policy'
                  )}
                  color="#c4c4c4">
                  {t('global.bookPolicy.prefix')}
                  <span
                    className={clsx('fw-bold ')}
                    role="button"
                    onClick={() => {
                      handleOpenPolicy('yeta');
                    }}>
                    {t('global.bookPolicy.word')}
                  </span>
                  {t('global.bookPolicy.suffix')}
                </Typography>
              </Box>
            </Box>
            <Box
              className={clsx(
                'w-90 mt-1 mt-md-auto mb-md-4 px-3 px-md-5 d-flex justify-content-center align-items-start'
              )}>
              <Checkbox
                className={clsx('p-0')}
                sx={{ borderColor: ThemeBlue.primary.main }}
                checked={pocPolicyAccepted}
                onChange={(evt) => {
                  setPocPolicyAccepted(evt.target.checked);
                }}
              />
              <Box>
                <Typography
                  className={clsx(
                    'p-0 fs-md-6 text-start text-md-center policy'
                  )}
                  color="#c4c4c4">
                  {t('global.pocAntigenPolicy.prefix')}
                  <span
                    className={clsx('fw-bold ')}
                    role="button"
                    onClick={() => {
                      handleOpenPolicy('poc');
                    }}>
                    {t('global.pocAntigenPolicy.word')}
                  </span>
                  {t('global.pocAntigenPolicy.suffix')}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      <Box
        sx={{ zIndex: '999' }}
        className={clsx('w-100 mt-auto position-sticky bottom-0')}>
        {!!testType &&
          !!appointment &&
          personsCount === persons.length &&
          editPersonIdx === null && (
            <ColorButton
              sx={{ padding: '1rem', borderRadius: '0' }}
              fullWidth
              variant="contained"
              onClick={bookAppointment}
              disabled={
                !(
                  (personsCount === persons.length ||
                    (editPersonIdx === null &&
                      yetaPolicyAccepted &&
                      pocPolicyAccepted &&
                      !!persons.length &&
                      checkFormValidation())) &&
                  yetaPolicyAccepted &&
                  pocPolicyAccepted
                )
              }>
              {t('global.bookNow')}
            </ColorButton>
          )}
        {!testType && (
          <ColorButton
            sx={{ padding: '1rem', borderRadius: '0' }}
            fullWidth
            variant="contained"
            onClick={() => {
              navigate('/reservation/' + BookingSteps.TEST_TYPE);
            }}>
            {t('registration.step.test-type')}
          </ColorButton>
        )}
        {testType && !appointment && (
          <ColorButton
            sx={{ padding: '1rem', borderRadius: '0' }}
            fullWidth
            variant="contained"
            onClick={() => {
              navigate('/reservation/' + BookingSteps.SELECT_APPOINTMENT);
            }}>
            {t('registration.step.select-appointment')}
          </ColorButton>
        )}
      </Box>
      <PolicyDialog
        open={openPolicy}
        onClose={handleClosePolicy}
        content={policyDialogContent}
        title={policyDialogTitle}
      />
      {
        // @ts-ignore
        isLoading && 1 === 2 && (
          <Box
            className={clsx(
              'w-100 h-100 position-absolute opacity-75 d-flex align-items-center justify-content-center top-0'
            )}
            sx={{ backgroundColor: ThemeBlue.background.default, zIndex: 999 }}>
            <Box className={clsx('w-75 position-absolute')}>
              <Skeleton sx={{ background: 'rgba(149,149,149, .6)' }} />
              <Skeleton
                animation="wave"
                sx={{ background: 'rgba(149,149,149, .6)' }}
              />
              <Skeleton sx={{ background: 'rgba(149,149,149, .6)' }} />
            </Box>
          </Box>
        )
      }
    </Box>
  );
};
