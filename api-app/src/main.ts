import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppConfigService } from './config/app-config/app-config.service';
import { AdministrationService } from './administration/administration.service';
import { StatisticsService } from './statistics/statistics.service';

function normalizeApiPath(url: string, apiPrefix: string): string {
  const prefix = `/${apiPrefix}`;
  const path = url.split('?')[0];

  if (path === prefix) {
    return '/';
  }

  if (path.startsWith(`${prefix}/`)) {
    return path.slice(prefix.length);
  }

  return path;
}

function registerReadCompatibilityMiddleware(
  app: NestExpressApplication,
  apiPrefix: string
) {
  const administrationService = app.get(AdministrationService);
  const statisticsService = app.get(StatisticsService);

  app.use(async (request, response, next) => {
    if (request.method !== 'GET') {
      next();
      return;
    }

    const path = normalizeApiPath(request.url, apiPrefix);

    try {
      if (path === '/admin/settings' || path === '/settings') {
        response.json(await administrationService.getSettings());
        return;
      }

      if (path === '/admin/appointments') {
        response.json(await administrationService.findAppointments(request.query));
        return;
      }

      if (path === '/admin/clients') {
        response.json(await administrationService.getClients());
        return;
      }

      if (path === '/admin/agents') {
        response.json(await administrationService.getAgents());
        return;
      }

      if (path === '/statistics/appointments-by-date') {
        response.json(await statisticsService.getAppointmentsStatisticsByDate());
        return;
      }

      if (path !== request.url) {
        request.url = request.url.slice(`/${apiPrefix}`.length) || '/';
      }

      next();
    } catch (error) {
      next(error);
    }
  });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: AppConfigService = app.get(AppConfigService);
  const apiPrefix = 'test-app-api';
  const port = configService.appPort;

  app.enableCors();
  registerReadCompatibilityMiddleware(app, apiPrefix);

  await app.listen(port, () => {
    Logger.log(`Listening at localhost: ${port}`);
    Logger.log(`Accepting API routes with and without /${apiPrefix}`);
    Logger.log(`Running in ${configService.appEnv} mode`);
  });
}
bootstrap();
