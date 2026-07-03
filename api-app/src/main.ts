import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppConfigService } from './config/app-config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: AppConfigService = app.get(AppConfigService);
  const apiPrefix = 'test-app-api';
  const port = configService.appPort;

  app.setGlobalPrefix(apiPrefix);
  app.enableCors();

  await app.listen(port, () => {
    Logger.log(`Listening at localhost: ${port}/${apiPrefix}`);
    Logger.log(`Running in ${configService.appEnv} mode`);
  });
}
bootstrap();
