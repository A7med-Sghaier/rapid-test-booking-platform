import { Countries } from '../resources/countries';

/*************************************************************
 * booking-app - countries-util.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 15.01.22 - 18:53
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
export interface ItemCountryProps {
  alpha3: string;
  name: string;
}
export const getGroupedCountries = (lng = 'de') => {
  const priorCountries = [276, 40, 380];
  const priorGroup = Countries.filter((country) =>
    priorCountries.includes(country.id)
  )
    .map((country: any) => ({ alpha3: country.alpha3, name: country[lng] }))
    .sort((a: ItemCountryProps, b: ItemCountryProps) =>
      a.name > b.name ? 1 : -1
    );

  const rest = Countries.filter(
    (country) => !priorCountries.includes(country.id)
  ).map((country: any) => ({ alpha3: country.alpha3, name: country[lng] }));

  return { priorCountries: priorGroup, allCountries: rest };
};

export const getAllCountries = (lng = 'de') => {
  return Countries.map((country: any) => country[lng]);
};
