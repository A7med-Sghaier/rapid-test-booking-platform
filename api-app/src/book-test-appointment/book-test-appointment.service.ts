import { Inject, Injectable } from '@nestjs/common';
import { generateAppointmentID, generateQRCode } from '../utils/qr-code';
import { Db } from 'mongodb';
import { MailService } from '../config/mail-config/mail.service';
import { generateAttachedQrPDF } from '../utils/pdf-utils';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { btoa } from 'buffer';
import { AppConfigService } from '../config/app-config/app-config.service';
import { SocketEventsService } from '../sokets-events/socket-events.service';

@Injectable()
export class BookTestAppointmentService {
  constructor(
    @Inject('MONGO-PROVIDER') private db: Db,
    private mailService: MailService,
    private appConfigService: AppConfigService,
    private socketEventsService: SocketEventsService
  ) {}

  async createTestAppointment(host, appointmentData): Promise<object> {
    appointmentData.bookedFrom = this.appConfigService.appName + '-APP';
    appointmentData.appointmentUid = generateAppointmentID(
      appointmentData.appointment
    );
    appointmentData.persons.forEach((person) => {
      person.uid = generateAppointmentID();
    });

    return await new Promise((resolve, reject) => {
      this.db
        .collection(this.appConfigService.appointmentsCollection)
        .insertOne({
          ...appointmentData,
          createDate: new Date(),
          lastModified: new Date(),
        })
        .then(
          (result) => {
            if (result.insertedId) {
              this.socketEventsService.socket.emit(
                'appointments-update',
                'appointment-created'
              );
            }

            const cancelUrl =
              host +
              '/booking-cancel/' +
              btoa(encodeURI(JSON.stringify(appointmentData)));
            const rebookUrl =
              host +
              '/requested-persons/' +
              btoa(encodeURI(JSON.stringify(appointmentData.persons)));

            const checkinUrl =
              host +
              'test-app-api/check-in/' +
              btoa(
                encodeURI(
                  `${result.insertedId}-${appointmentData.appointmentUid}`
                )
              );
            generateQRCode(checkinUrl).then(
              (qr) => {
                const title =
                  'Hiermit  erhalten Sie Ihren persönlichen Check-In QR-Code für den Test';
                generateAttachedQrPDF(qr, title).then(
                  (qrPdf) => {
                    this.mailService
                      .sendMail({
                        data: {
                          data: {
                            ...this.buildMailData(appointmentData),
                            cancelUrl,
                            rebookUrl,
                          },
                        },
                        cc: appointmentData.persons.map(
                          (person) => person.email
                        ),
                        subject: 'Buchungsbestätigung',
                        to: appointmentData.persons[0].email,
                        template: 'bookingConfirmationMailTemplate.pug',
                        attachments: [{ filename: 'qr.pdf', content: qrPdf }],
                      })
                      .then(
                        (success) => {
                          resolve({ ok: true, data: qr });
                        },
                        (error) => {
                          reject({
                            ok: false,
                            error: {
                              type: 'create Appointment : Error during sending Mail',
                              msg: error,
                            },
                          });
                        }
                      );
                  },
                  (error) => {
                    reject({
                      ok: false,
                      error: {
                        type: 'create Appointment : Error during generating QR-PDF',
                        msg: error,
                      },
                    });
                  }
                );
              },
              (error) => {
                reject({
                  ok: false,
                  error: {
                    type: 'create Appointment : Error during generating QR-Code',
                    msg: error,
                  },
                });
              }
            );
          },
          (err) => {
            reject({
              ok: false,
              error: {
                type: 'create Appointment : Error during insert appointment',
                msg: err,
              },
            });
          }
        );
    });
  }

  async getBookedSlots(): Promise<any> {
    const now = new Date();
    return await this.db
      .collection(this.appConfigService.appointmentsCollection)
      .aggregate([
        { $match: { appointment: { $gt: now.toISOString() } } },
        {
          $project: {
            _id: 0,
            appointment: 1,
            persons: {
              $filter: {
                input: '$persons',
                as: 'persons',
                cond: { $ne: ['$$persons.status', 'canceled'] },
              },
            },
          },
        },
        {
          $project: {
            appointment: 1,
            personsCount: {
              $size: '$persons',
            },
          },
        },
        {
          $match: {
            personsCount: { $gt: 0 },
          },
        },
      ])
      .sort({ appointment: 1 })
      .toArray();
  }

  buildMailData(booking) {
    const appointmentDate = parseISO(booking.appointment);
    const testLabel = booking.testType.label;
    const data = {
      person: booking.persons[0],
      testType: {
        label: testLabel,
        price: booking.testType.price,
      },
      appointment:
        format(appointmentDate, 'PPPP', { locale: de }) +
        ' (' +
        format(appointmentDate, 'HH:mm', { locale: de }) +
        ' Uhr)',
      persons: booking.persons
        .map((person) => person.firstName + ' ' + person.secondName)
        .join(', '),
      center: {
        name: 'Schnelltestzentrum ISARTOR',
        address: 'Dachauer Str. 21, 80803 München',
      },
    };
    return data;
  }
}
