import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { generateQRCode } from '../utils/qr-code';
import { btoa } from 'buffer';
import { MailService } from '../config/mail-config/mail.service';
import { generateAttachedQrPDF } from '../utils/pdf-utils';

@Injectable()
export class RequestQrService {
  constructor(
    @Inject('MONGO-PROVIDER') private db: Db,
    private mailService: MailService
  ) {}

  async getBookingPersonsByEmail(host: string, email: string): Promise<object> {
    return await new Promise((resolve, reject) => {
      this.db
        .collection('appointment')
        .aggregate([
          {
            $sort: {
              createDate: -1,
            },
          },
          {
            $match: {
              'persons.email': email,
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              _id: false,
              persons: '$persons',
            },
          },
          {
            $project: {
              'persons.country': 1,
              'persons.birthDate': 1,
              'persons.firstName': 1,
              'persons.secondName': 1,
              'persons.email': 1,
              'persons.email_repeat': 1,
              'persons.telephone': 1,
              'persons.city:': 1,
              'persons.address': 1,
              'persons.postalCode': 1,
            },
          },
        ])
        .toArray()
        .then(
          (result) => {
            const persons = result.length ? result[0].persons : [];
            const url =
              host +
              '/requested-persons/' +
              btoa(encodeURI(JSON.stringify(persons)));
            generateQRCode(url).then((qr) => {
              generateAttachedQrPDF(
                qr,
                'Mit diesem QR CODE können Sie erneut einen Termin buchen'
              ).then((qrPdf) => {
                this.mailService
                  .sendMail({
                    data: { data: { url } },
                    subject: 'Request Registration Data',
                    to: email,
                    template: 'requestRegistrationDataMailTemplate',
                    attachments: [{ filename: 'qr.pdf', content: qrPdf }],
                  })
                  .then(
                    (success) => {
                      resolve({ ok: true, url, qr });
                    },
                    (error) => {
                      reject({ ok: false, error });
                    }
                  );
              });
            });
          },
          (error) => {
            reject({
              error: true,
              msg: 'an error occurred when request Persons by Email: ' + error,
            });
          }
        );
    });
  }
}

/**
 * 'persons.checkedIn': 0,
 *               'persons.checkedInAt': 0,
 *               'persons.checkedInBy': 0,
 *               'persons.status': 0,
 *               'persons.resultEmittedAt': 0,
 *               'persons.resultEmittedBy': 0,
 *               'persons.testResult': 0,
 *               'persons.canceled': 0,
 *               'persons.canceledAt': 0,
 *               'persons.canceledBy': 0,
 */
