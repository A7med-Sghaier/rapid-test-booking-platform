import { Controller, Get, Inject } from '@nestjs/common';
import { Db } from 'mongodb';
import { AppService } from './app.service';
import { AppConfigService } from './config/app-config/app-config.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appConfig: AppConfigService,
    @Inject('MONGO-PROVIDER') private readonly db: Db
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(['admin/settings', 'settings'])
  async getSettings(): Promise<any[]> {
    return this.db.collection(this.appConfig.settingsCollection).find().toArray();
  }
}
