/*************************************************************
 * api-app - file-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 09.02.22 - 15:42
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
export const imageToBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
