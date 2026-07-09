import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfigService } from './config/app-config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: AppConfigService = app.get(AppConfigService);
  const apiPrefix = 'test-app-api';
  const port = configService.appPort;

  app.setGlobalPrefix(apiPrefix);
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rapid Test Booking Platform API')
    .setDescription(
      'Appointment booking, check-in, and administration endpoints for the ' +
        'rapid-test operations platform.'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.listen(port, () => {
    Logger.log(`Listening at localhost: ${port}/${apiPrefix}`);
    Logger.log(`API docs at localhost: ${port}/${apiPrefix}/docs`);
    Logger.log(`Running in ${configService.appEnv} mode`);
  });
}
bootstrap();
