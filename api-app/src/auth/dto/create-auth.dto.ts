/*************************************************************
 * api-app - create-auth.dto.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 26.01.22 - 18:06
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
