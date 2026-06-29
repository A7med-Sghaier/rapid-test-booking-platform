import { Module } from '@nestjs/common';
import { MongoAppService } from './mongo-app.service';
import { AppConfigModule } from '../app-config/app-config.module';
import { MongoProvider } from './mongo-provider';

@Module({
  imports: [AppConfigModule],
  providers: [MongoAppService, MongoProvider],
  exports: [MongoProvider.provide],
})
export class MongoAppModule {}
