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

  app.enableCors();
  app.use((request, _response, next) => {
    const prefix = `/${apiPrefix}`;

    if (request.url === prefix) {
      request.url = '/';
    }

    if (request.url.startsWith(`${prefix}/`)) {
      request.url = request.url.slice(prefix.length);
    }

    next();
  });

  await app.listen(port, () => {
    Logger.log(`Listening at localhost: ${port}`);
    Logger.log(`Accepting API routes with and without /${apiPrefix}`);
    Logger.log(`Running in ${configService.appEnv} mode`);
  });
}
bootstrap();
