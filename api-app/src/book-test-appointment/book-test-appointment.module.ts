import { Module } from '@nestjs/common';
import { BookTestAppointmentService } from './book-test-appointment.service';
import { BookTestAppointmentController } from './book-test-appointment.controller';
import { MongoAppModule } from '../config/mongo-app/mongo-app.module';
import { MailModule } from '../config/mail-config/mail.module';
import { AppConfigModule } from '../config/app-config/app-config.module';

@Module({
  imports: [MongoAppModule, MailModule, AppConfigModule],
  controllers: [BookTestAppointmentController],
  providers: [BookTestAppointmentService],
})
export class BookTestAppointmentModule {}
