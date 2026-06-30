import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { AppConfigModule } from '../app-config/app-config.module';
import { AppConfigService } from '../app-config/app-config.service';

@Module({
  providers: [MailService],
  exports: [MailService],
  imports: [
    AppConfigModule,
    MailerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => ({
        transport: {
          host: appConfigService.mailHost,
          port: appConfigService.mailPort,
          ignoreTLS: !appConfigService.mailSecure,
          secure: appConfigService.mailSecure,
          debug: appConfigService.appEnv !== 'production',
          auth: {
            user: appConfigService.mailUser,
            pass: appConfigService.mailPwd,
          },
        },
        defaults: {
          from: `"${appConfigService.appName} - No Reply" <no-reply@${appConfigService.appDomain}>`,
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
})
export class MailModule {}
