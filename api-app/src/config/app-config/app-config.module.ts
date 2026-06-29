/*************************************************************
 * api-app - app-config.module.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 20.01.22 - 23:14
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './app-config.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  exports: [AppConfigService],
  providers: [AppConfigService],
})
export class AppConfigModule {}
