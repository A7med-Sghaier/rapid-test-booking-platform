import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppConfigService } from './config/app-config/app-config.service';
import * as crypto from 'crypto';
import { getUnixTime, parseISO } from 'date-fns';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: AppConfigService = app.get(AppConfigService);
  const globalPrefix = 'test-app-api';
  app.setGlobalPrefix(globalPrefix);
  const port = configService.appPort;
  app.enableCors();

  await app.listen(port, () => {
    Logger.log(`Listening at localhost: ${port} +'/' +${globalPrefix}`);
    Logger.log(`Running in  at localhost: ${configService.appEnv} mode`);
  });
}
bootstrap();
