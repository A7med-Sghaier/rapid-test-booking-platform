import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { AppConfigService } from './config/app-config/app-config.service';
import { AdministrationService } from './administration/administration.service';
import { StatisticsService } from './statistics/statistics.service';
import express = require('express');

const apiPrefix = 'test-app-api';
let administrationService: AdministrationService;
let statisticsService: StatisticsService;

function createExpressServer() {
  const server = express();
  const prefix = `/${apiPrefix}`;

  server.use((request, _response, next) => {
    if (request.url === prefix) {
      request.url = '/';
    }

    if (request.url.startsWith(`${prefix}/`)) {
      request.url = request.url.slice(prefix.length);
    }

    next();
  });

  server.get('/admin/settings', async (_request, response, next) => {
    try {
      response.json(await administrationService.getSettings());
    } catch (error) {
      next(error);
    }
  });

  server.get('/settings', async (_request, response, next) => {
    try {
      response.json(await administrationService.getSettings());
    } catch (error) {
      next(error);
    }
  });

  server.get('/admin/appointments', async (request, response, next) => {
    try {
      response.json(await administrationService.findAppointments(request.query));
    } catch (error) {
      next(error);
    }
  });

  server.get('/admin/clients', async (_request, response, next) => {
    try {
      response.json(await administrationService.getClients());
    } catch (error) {
      next(error);
    }
  });

  server.get('/admin/agents', async (_request, response, next) => {
    try {
      response.json(await administrationService.getAgents());
    } catch (error) {
      next(error);
    }
  });

  server.get('/statistics/appointments-by-date', async (_request, response, next) => {
    try {
      response.json(await statisticsService.getAppointmentsStatisticsByDate());
    } catch (error) {
      next(error);
    }
  });

  return server;
}

async function bootstrap() {
  const server = createExpressServer();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server)
  );
  const configService: AppConfigService = app.get(AppConfigService);
  const port = configService.appPort;

  administrationService = app.get(AdministrationService);
  statisticsService = app.get(StatisticsService);

  app.enableCors();

  await app.listen(port, () => {
    Logger.log(`Listening at localhost: ${port}`);
    Logger.log(`Accepting API routes with and without /${apiPrefix}`);
    Logger.log(`Running in ${configService.appEnv} mode`);
  });
}
bootstrap();
