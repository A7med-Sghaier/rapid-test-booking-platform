import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { MongoAppModule } from '../config/mongo-app/mongo-app.module';
import { MailModule } from '../config/mail-config/mail.module';
import { AppConfigModule } from '../config/app-config/app-config.module';

@Module({
  imports: [MongoAppModule, MailModule, AppConfigModule],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
