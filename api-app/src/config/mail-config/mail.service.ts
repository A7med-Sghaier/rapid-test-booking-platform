import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { type } from 'os';

interface MailOptionsProps {
  data: any;
  subject: string;
  cc?: string[];
  to: string;
  template?: string;
  from?: string;
  attachments?: any[];
}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public sendMail(mailOptions: MailOptionsProps) {
    this.cleanAttributes(mailOptions.data.data);
    let options = {
      to: mailOptions.to,
      subject: mailOptions.subject,
      cc: mailOptions.cc,
      template: mailOptions.template,
      context: mailOptions.data,
      attachments: mailOptions.attachments,
    };
    if (mailOptions.from) {
      options['from'] = mailOptions.from;
    }

    if (mailOptions.cc) {
      options['cc'] = mailOptions.cc;
    }

    return this.mailerService.sendMail(options);
  }

  public cleanAttributes(data: any) {
    Object.keys(data).forEach((key) => {
      try {
        const value = JSON.parse(data[key])?.value;
        if (value == null || value == '') {
          delete data[key];
        }
      } catch (e) {}
    });
  }
}
