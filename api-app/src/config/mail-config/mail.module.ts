import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { AppConfigService } from '../app-config/app-config.service';

@Module({
  providers: [MailService],
  exports: [MailService],
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'rw0b73.webhosting.systems',
          ignoreTLS: true,
          secure: true, // true for 465, false for other ports
          debug: true,
          auth: {
            user: 'yeta@qontrola.com', // generated user
            pass: 'Wasser13!', // generated password
          },
        },
        defaults: {
          from: `"Yeta-Test01 - No Reply" <no-reply@qontrola.com>`,
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
