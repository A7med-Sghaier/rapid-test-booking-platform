import { Module } from '@nestjs/common';
import { AdministrationService } from './administration.service';
import { AdministrationController } from './administration.controller';
import { AppConfigModule } from '../config/app-config/app-config.module';
import { MongoAppModule } from '../config/mongo-app/mongo-app.module';
import { MailModule } from '../config/mail-config/mail.module';

@Module({
  imports: [AppConfigModule, MongoAppModule, MailModule],
  controllers: [AdministrationController],
  providers: [AdministrationService],
})
export class AdministrationModule {}
