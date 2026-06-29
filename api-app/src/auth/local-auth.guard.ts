/*************************************************************
 * api-app - local-auth.guard.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 26.01.22 - 18:04
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
