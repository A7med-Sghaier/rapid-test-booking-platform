/*************************************************************
 * api-app - update-auth.dto.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 26.01.22 - 18:06
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
