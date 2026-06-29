import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { AppConfigService } from '../app-config/app-config.service';

export const MailProvider = {
  provide: 'Mail-Provider',
  isGlobal: true,
  useFactory: async (appConfigService: AppConfigService): Promise<any> => ({
    transport: {
      host: appConfigService.mailHost,
      ignoreTLS: true,
      secure: true, // true for 465, false for other ports
      debug: true,
      auth: {
        user: appConfigService.mailUser, // generated user
        pass: appConfigService.mailPwd, // generated password
      },
    },
    defaults: {
      from: `"Yeta-Test01 - No Reply" <no-reply@${appConfigService.appDomain}>`,
    },
    template: {
      dir: __dirname + '/templates',
      adapter: new PugAdapter(),
      options: {
        // strict: true,
      },
    },
  }),
  inject: [AppConfigService],
};
