import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookTestAppointmentModule } from './book-test-appointment/book-test-appointment.module';
import { AdministrationModule } from './administration/administration.module';
import { RequestQrModule } from './request-qr/request-qr.module';
import { AppConfigModule } from './config/app-config/app-config.module';
import { MongoAppModule } from './config/mongo-app/mongo-app.module';
import { MailModule } from './config/mail-config/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from './config/app-config/app-config.service';
import { SocketEventsModule } from './sokets-events/socket-events.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    AuthModule,
    BookTestAppointmentModule,
    AdministrationModule,
    RequestQrModule,
    AppConfigModule,
    MongoAppModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: (appConf: AppConfigService) => ({
        secret: appConf.authJwtSecret,
        signOptions: { expiresIn: '8h' },
      }),
      inject: [AppConfigService],
    }),
    SocketEventsModule,
    StatisticsModule,
  ],
  exports: [AppConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
