import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataFormContext } from '../../../../../contexts/forms/data-form-context';
import { addAgent } from '../../../utils/agent-utils';
import { AgentForm } from '../../../resources/forms/agent-form';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Form } from '../../../../../components/forms/form';
import clsx from 'clsx';
import { Skeleton } from '@mui/lab';
import { ColorButton } from '../../../../../components/buttons/buttons';

/*************************************************************
 * booking-app - new-agent-dialog.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 06.02.22 - 19:50
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
interface NewAgentDialogProps {
  openAgentForm: boolean;
  openDialog: (open: boolean) => void;
}

export const NewAgentDialog: React.FC<NewAgentDialogProps> = ({
  children,
  openAgentForm,
  openDialog,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [existedUser, setExistedUser] = useState<string | undefined>();
  const [existedEmail, setExistedEmail] = useState<string | undefined>();
  const { formValues, cleanForm, checkFormValidation, setFormTemplate } =
    useContext(DataFormContext);

  const handleCancel = () => {
    cleanForm();
    openDialog(false);
  };

  const handleSave = () => {
    setIsLoading(true);
    addAgent(formValues).then((response) => {
      if (response && response.acknowledged === true && !!response.insertedId) {
        setExistedUser(undefined);
        setIsLoading(false);
        openDialog(false);
      } else {
        setIsLoading(false);
        setExistedUser(response.existedUsername);
        setExistedEmail(response.existedEmail);
      }
    });
  };

  useEffect(() => {
    setFormTemplate(AgentForm);
  });

  return (
    <Dialog
      open={openAgentForm}
      //  onClose={handleClose}
      // scroll={scroll}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description">
      <DialogTitle id="scroll-dialog-title">{t('admin.addAgent')}</DialogTitle>
      <DialogContent dividers>
        <Form form={AgentForm} />
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
          disabled={
            !checkFormValidation() ||
            isLoading ||
            (!!existedUser && existedUser === formValues?.userName) ||
            (!!existedEmail && existedEmail === formValues?.email)
          }
          sx={{ backgroundColor: '#617c85' }}>
          {t('form.save')}
        </ColorButton>
      </DialogActions>
    </Dialog>
  );
};
