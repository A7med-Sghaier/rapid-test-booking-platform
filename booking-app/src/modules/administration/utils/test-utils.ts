import {
  PersonPropsForAdmin,
  TEST_RESULT,
  TestData,
} from '../resources/interfaces';
import { urlBuilder, urlParamsBinder } from '../../../utils/http/http-utils';
import { TestKit } from '../../../interfaces/booking-interface';

/*************************************************************
 * booking-app - test-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 31.01.22 - 19:21
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/

export const emitTestResult = async (
  appointmentUid: string,
  uid: string,
  testResult: TEST_RESULT,
  person: PersonPropsForAdmin,
  agentId: string,
  testData: TestData,
  testKit: string
): Promise<TestData[]> => {
  return await fetch(urlBuilder('/admin/emit-result'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      appointmentUid,
      uid,
      testResult,
      person,
      agentId,
      testData,
      testKit,
    }),
  }).then((response) => {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
};
