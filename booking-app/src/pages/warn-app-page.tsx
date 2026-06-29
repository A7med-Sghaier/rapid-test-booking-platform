/*************************************************************
 * booking-app - warn-app-page.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 14.02.22 - 17:17
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useState } from 'react';
import {
  Box,
  Checkbox,
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { ThemeBlue } from '../themes/theme-blue';
import { GlobalAppContext } from '../contexts/global-app-context';
import { useTranslation } from 'react-i18next';
import { ColorButton } from '../components/buttons/buttons';
import { Form } from '../components/forms/form';
import {
  CwaAgreementFrom,
  ResultEligibleFrom,
} from '../resources/forms/cwa-forms';
import { DataFormContext } from '../contexts/forms/data-form-context';
import { PolicyDialog } from '../components/dialogs/policy-dialog';
import { cwaTransmission } from '../utils/cwa-utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export enum AGREEMENT_TYPE {
  NO_TRANSMISSION = 'noTransmission',
  TRANSMISSION_OF_DATA = 'transmissionOfData',
  TRANSMISSION_ANONYM = 'transmissionAnonym',
}

export const WarnAppPage: React.FC = ({ children }) => {
  const { formValues } = useContext(DataFormContext);
  const navigate = useNavigate();
  const { credentials } = useParams();
  const { center } = useContext(GlobalAppContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState(0);
  const [cwaData, setCwaData] = useState(0);

  const handleAgreement = (cwaPolicy: boolean) => {
    setIsLoading(true);
    setActiveStep(1);
    cwaTransmission(
      credentials as string,
      formValues.agreement,
      cwaPolicy
    ).then((data) => {
      if (!!data.ok && data.url && data.cwaQr) {
        setCwaData(data);
      }
      setIsLoading(false);
    });
  };

  return (
    <Container className={clsx('h-100 w-100 p-0 d-flex flex-column')}>
      <Paper
        className={clsx('w-100')}
        elevation={3}
        sx={{ backgroundColor: ThemeBlue.background.default }}>
        <Box
          className={clsx(
            'w-100 py-2 px-2 d-flex align-items-center justify-content-between'
          )}
          sx={{ background: ThemeBlue.primary.main }}>
          <Box className={clsx('w-100 d-flex flex-column ps-1 ps-md-4 py-1')}>
            <Typography
              className={clsx('fw-bolder text-white')}
              sx={{ fontSize: '1.2rem' }}>
              {center?.name}
            </Typography>
            <Box
              className={clsx(
                'w-100 d-flex justify-content-center text-light opacity-75'
              )}>
              <Typography
                className={clsx('fw-bold ')}
                sx={{ fontSize: '0.8rem' }}>
                {`${center?.address}${
                  (center?.city || center?.postalCode) && ','
                }`}
              </Typography>
              <span>&nbsp;</span>
              <Typography
                className={clsx('fw-bold')}
                sx={{ fontSize: '0.8rem' }}>
                {center?.postalCode} {center?.city}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
      <Box
        className={clsx(
          'w-100 px-2 py-3 d-flex flex-column flex-grow-1 justify-content-center align-items-center'
        )}
        sx={{ backgroundColor: `${ThemeBlue.background.default} !important` }}
        gap="0.3rem">
        <Paper className={clsx('w-100 h-100 my-3 pt-4')} elevation={2}>
          <Box
            className={clsx(
              'px-3 px-md-5 w-100 h-100 d-flex flex-column justify-content-between-'
            )}>
            <Box
              className={clsx('w-100  fw-bolder mb-4')}
              sx={{ fontSize: '1.2rem' }}>
              {`"Corona-Warn-App" - Start`}
            </Box>
            <Box className={clsx('mt-4 mb-3 px-md-5')}>
              <Stepper activeStep={activeStep}>
                {/*
                  <Step>
                  <StepLabel>Ergebnis berechtigt</StepLabel>
                </Step>

                 */}
                <Step>
                  <StepLabel>Ihre Zustimmung</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Ergebnis übertragen</StepLabel>
                </Step>
              </Stepper>
            </Box>
            <Box
              className={clsx(
                'h-auto mt-2 flex-grow-1 px-md-5 d-flex flex-column overflow-scroll'
              )}>
              {activeStep === 10 && (
                <Step_1
                  credentials={credentials as string}
                  setActiveStep={setActiveStep}
                />
              )}
              {activeStep === 0 && <Step_2 handleAgreement={handleAgreement} />}
              {activeStep === 1 && (
                <Step_3 cwaData={cwaData} isLoading={isLoading} />
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

interface Step_1Props {
  credentials: string;
  setActiveStep: (step: number) => void;
}
const Step_1: React.FC<Step_1Props> = ({
  children,
  credentials,
  setActiveStep,
}) => {
  const { formValues } = useContext(DataFormContext);
  return (
    <>
      <Box className={clsx(' mt-3 d-flex flex-column')}>
        <Form
          form={ResultEligibleFrom}
          defaultValues={{ token: credentials }}
        />
      </Box>
      <Box
        className={clsx('px-md-5 text-start my-auto')}
        sx={{ fontSize: '.8rem' }}>
        <Box className={clsx('text-start fw-bold')}>
          {`"Corona-Warn-App" Zustimmung nicht erteilt`}
        </Box>
        <Box className={clsx('text-start ')}>
          {`Um Ihr Ergebnis an die "Corona-Warn-App" zu übertragen, müssen Sie den Datenschutzbestimmungen zustimmen.`}
        </Box>
        <Box className={clsx('text-center mt-4')}>
          <ColorButton
            onClick={() => {
              setActiveStep(1);
            }}
            disabled={!formValues.testDate}>
            Zustimmung erteilen
          </ColorButton>
        </Box>
      </Box>
    </>
  );
};

interface Step_2Props {
  handleAgreement: (cwaPolicy: boolean) => void;
}

const Step_2: React.FC<Step_2Props> = ({ children, handleAgreement }) => {
  const { t } = useTranslation();
  const [cwaPolicyAccepted, setCwaPolicyAccepted] = useState<boolean>(false);
  const [openPolicyDialog, setOpenPolicyDialog] = useState<boolean>(false);
  const { formValues } = useContext(DataFormContext);

  return (
    <Box className={clsx('d-flex flex-column text-start my-auto pb-4')}>
      <Box className={clsx('fw-bold')} sx={{ fontSize: '1.2rem' }}>
        Ihre Zustimmung
      </Box>
      <Box className={clsx('fw-bold my-2')} sx={{ fontSize: '1rem' }}>
        Hinweise zum Datenschutz
      </Box>
      <Box className={clsx('mt-1')} sx={{ fontSize: '.8rem' }}>
        Ich bin mir bewusst, dass ich mit der Eingabe meiner E-Mail-Adresse die
        Erlaubnis erteile, dass meine in der unten angebotenen Auswahl näher
        spezifizierten Daten als Patient über das Internet an meine angegebene
        E-Mail-Adresse übermittelt werden. Dies kann durch Nutzung verschiedener
        Technologien auch für Dritte sichtbar sein. Diesem Risiko bin ich mir
        bewusst und erteile explizit den Auftrag gemäß unten getätigter Auswahl,
        für den ausgewählten Testtoken.
      </Box>
      <Box className={clsx('fw-bold my-2')} sx={{ fontSize: '1rem' }}>
        Einwilligung ohne Übergabe von persönlichen Daten an die
        {`"Corona-Warn-App"`}
      </Box>
      <Box className={clsx('mt-1')} sx={{ fontSize: '1rem' }}>
        Das Einverständnis des Getesteten zum Übermitteln des Testergebnisses
        und des Codes aus Vor- und Nachnamen, Geburtsdatum, der Kennzeichnung
        des Tests in der Teststelle und einer Zufallszahl für Zwecke der
        Corona-Warn-App auf den vom RKI betriebenen Server wurde erteilt. Dem
        Getesteten wurden Hinweise zum Datenschutz ausgehändigt (siehe
        Erläuterung oben).
      </Box>
      <Box className={clsx('fw-bold my-2')} sx={{ fontSize: '1rem' }}>
        Einwilligung mit Übergabe von persönlichen Daten zwecks mehr
        Funktionalität
      </Box>
      <Box className={clsx('mt-1')} sx={{ fontSize: '1rem' }}>
        Das Einverständnis des Getesteten zum Übermitteln des Testergebnisses
        und des Codes aus Vor- und Nachnamen, Geburtsdatum, der Kennzeichnung
        des Tests in der Teststelle und einer Zufallszahl für Zwecke der
        Corona-Warn-App auf den vom RKI betriebenen Server wurde erteilt. Der
        Getestete willigte außerdem in die Übermittlung von Vor- und Nachnamen
        und Geburtsdatum an die App zur Personalisierung des Testergebnisses
        ein. Dem Getesteten wurden Hinweise zum Datenschutz ausgehändigt (siehe
        Erläuterung oben).
      </Box>

      <Box className={clsx('my-3')}>
        <Form form={CwaAgreementFrom}></Form>
      </Box>

      <Box className={clsx('d-flex align-items-start mb-4')}>
        <Checkbox
          className={clsx('p-0')}
          sx={{ borderColor: ThemeBlue.primary.main }}
          checked={cwaPolicyAccepted}
          onChange={(evt) => {
            setCwaPolicyAccepted(evt.target.checked);
          }}
        />
        <Box className={clsx('d-flex justify-content-start')}>
          <Typography
            className={clsx('p-0 fs-md-6 text-start policy')}
            color="#c4c4c4">
            {t('cwa.cwaPolicy.prefix')}
            <span
              className={clsx('fw-bold ')}
              role="button"
              onClick={() => {
                setOpenPolicyDialog(true);
              }}>
              {t('cwa.cwaPolicy.word')}
            </span>
            {t('cwa.cwaPolicy.suffix')}
          </Typography>
        </Box>
      </Box>
      <ColorButton
        disabled={
          !cwaPolicyAccepted ||
          !formValues.agreement ||
          formValues.agreement === 'noTransmission'
        }
        onClick={() => {
          handleAgreement(cwaPolicyAccepted);
        }}>
        {t('form.save')}
      </ColorButton>
      <PolicyDialog
        open={openPolicyDialog}
        onClose={() => {
          setOpenPolicyDialog(false);
        }}
        content={t('cwa.cwaPolicy.text')}
        title={t('cwa.cwaPolicy.textTitle')}
      />
    </Box>
  );
};

interface Step_3Props {
  cwaData: any;
  isLoading: boolean;
}
const Step_3: React.FC<Step_3Props> = ({ children, cwaData, isLoading }) => {
  return (
    <Box className={clsx('mt-3 w-100 text-start')}>
      {!isLoading && !!cwaData && (
        <Box>
          <Box className={clsx('fw-bold')} sx={{ fontSize: '1.2rem' }}>
            Für dieses Gerät
          </Box>
          <Box className={clsx('mt-1 mb-2')} sx={{ fontSize: '1rem' }}>
            {`Sollten Sie die "Corona-Warn-App" auf diesem Gerät installiert haben, einfach hier klicken.`}
          </Box>
          <ColorButton className={clsx('mt-3 mb-3')}>
            <NavLink className={clsx('text-decoration-none')} to={cwaData.url}>
              Zertifikat auf dieses Gerät übertragen
            </NavLink>
          </ColorButton>
          <Box className={clsx('fw-bold mt-4')} sx={{ fontSize: '1.2rem' }}>
            Für ein anderes Gerät
          </Box>
          <Box className={clsx('mt-1 mb-2')} sx={{ fontSize: '1rem' }}>
            {`Sie können diesen QR-Code mit Ihrer "Corona-Warn-App" scannen.`}
          </Box>
          <Box className={clsx('mt-1 mb-2')} sx={{ fontSize: '1rem' }}>
            {`Achtung: jeder Test Code kann nur einmal gescannt werden.`}
          </Box>
          <Box className={clsx('w-100 text-center')}>
            <img
              style={{ width: '15rem', height: '15rem' }}
              src={cwaData.cwaQr}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

//Die Datenschutzhinweise zur Registrierung an der Corona-Warn-App habe ich gelesen, verstanden und akzeptiere sie als Teil des Vertrags.
