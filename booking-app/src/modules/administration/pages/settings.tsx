/*************************************************************
 * booking-app - settings.tsx
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 30.01.22 - 12:39
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import clsx from 'clsx';
import {
  BaseDataForm,
  HealthOfficeDataForm,
  OpeningTimesDataForm,
  TestKitsDataForm,
  TestTypesDataForm,
  TimeSlotsDataForm,
} from '../resources/forms/settings-forms';
import { DataFormProvider } from '../../../contexts/forms/data-form-context';
import { SettingsSection } from '../components/settings/settings-section';
import { GlobalAppContext } from '../../../contexts/global-app-context';

interface SettingsProps {}
export const Settings: React.FC<SettingsProps> = ({ children }) => {
  const { center } = useContext(GlobalAppContext);
  const [baseData, setBaseData] = useState<any>();
  const [openTimesData, setOpenTimesData] = useState<any>();
  const [maxPerSlotData, setMaxPerSlotData] = useState<any>();
  const [healthOfficeEmail, setHealthOfficeEmail] = useState<any>();
  const [testKits, setTestKits] = useState<any>([]);
  const [leistungen, setLeistungen] = useState<any>([]);

  const initSettingSections = () => {
    if (center && Object.keys(center).length) {
      setBaseData({
        logo: center.logo,
        name: center.name,
        address: center.address,
        postalCode: center.postalCode,
        city: center.city,
        country: center.country,
      });
      setOpenTimesData({ openingTimes: center.openingTimes });
      setMaxPerSlotData({ maxPerSlot: center.maxPerSlot });
      setHealthOfficeEmail({ healthOfficeEmail: center.healthOfficeEmail });
      setTestKits({ testKits: center.testKits || [] });
      setLeistungen({ testTypes: center.testTypes || [] });
    }
  };

  useEffect(() => {
    initSettingSections();
  }, [center]);

  return (
    <Box
      className={clsx('w-100 p-3 d-flex flex-column overflow-scroll')}
      id="settings-container">
      {/* Section Center Info*/}
      <DataFormProvider>
        <SettingsSection
          id="basic-data"
          form={BaseDataForm}
          title="Stammdaten"
          values={baseData}
        />
      </DataFormProvider>
      {/* Section Email*/}
      <DataFormProvider>
        <SettingsSection
          id="email"
          form={HealthOfficeDataForm}
          title="Gesundheitsamt-Daten"
          values={healthOfficeEmail}
        />
      </DataFormProvider>
      {/* Section Leistung*/}
      <DataFormProvider>
        <SettingsSection
          id="test-types"
          form={TestTypesDataForm}
          title="Leistungen"
          values={leistungen}
        />
      </DataFormProvider>
      {/* Section opening times*/}
      <DataFormProvider>
        <SettingsSection
          id="opening-times"
          form={OpeningTimesDataForm}
          title="Öffnungszeiten"
          values={openTimesData}
        />
      </DataFormProvider>
      {/* Section Slots*/}
      <DataFormProvider>
        <SettingsSection
          id="slots-settings"
          form={TimeSlotsDataForm}
          title="Zeitverwaltung"
          values={maxPerSlotData}
        />
      </DataFormProvider>
      {/* Section Test-Kits*/}
      <DataFormProvider>
        <SettingsSection
          id="test-kits"
          form={TestKitsDataForm}
          title="Test-Kits"
          values={testKits}
        />
      </DataFormProvider>
    </Box>
  );
};
