import { Module } from '@nestjs/common';
import { RequestQrService } from './request-qr.service';
import { RequestQrController } from './request-qr.controller';
import { MongoAppModule } from '../config/mongo-app/mongo-app.module';
import { MailModule } from '../config/mail-config/mail.module';

@Module({
  imports: [MongoAppModule, MailModule],
  controllers: [RequestQrController],
  providers: [RequestQrService],
})
export class RequestQrModule {}
