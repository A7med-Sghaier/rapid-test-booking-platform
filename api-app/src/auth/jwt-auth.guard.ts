/*************************************************************
 * api-app - jwt-auth.guard.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 26.01.22 - 18:02
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
