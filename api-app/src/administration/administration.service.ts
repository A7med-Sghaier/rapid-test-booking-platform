import { Inject, Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/app-config/app-config.service';
import { Db, ObjectId, ObjectID } from 'mongodb';
import { SocketEventsService } from '../sokets-events/socket-events.service';
import { generateQRCode } from '../utils/qr-code';
import { generateTestResultPDF } from '../utils/pdf-utils';
import { MailService } from '../config/mail-config/mail.service';
import { format, getUnixTime, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import * as crypto from 'crypto';
import { btoa } from 'buffer';
import {
  convertToBase64Url,
  convertToSHA256,
  decrypt,
  encrypt,
} from '../utils/encrypt-decrypt-utils';
import * as https from 'https';
import * as fs from 'fs';
import { buildCwaHash } from '../utils/cwa-utils';

@Injectable()
export class AdministrationService {
  constructor(
    private appConfig: AppConfigService,
    private mailService: MailService,
    private socketEventsService: SocketEventsService,
    @Inject('MONGO-PROVIDER') private db: Db
  ) {}

  async findAppointments({
    from,
    to,
  }: {
    from: string;
    to: string;
  }): Promise<any> {
    const filter = { appointment: { $gt: from, $lt: to } };
    return await this.db
      .collection(this.appConfig.appointmentsCollection)
      .aggregate([
        { $match: filter },
        {
          $unwind: {
            path: '$persons',
            includeArrayIndex: 'personIdx',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            person: '$persons',
            testType: 1,
            appointmentUid: 1,
            appointment: 1,
          },
        },
      ])
      .sort({ appointment: 1 })
      .toArray();
  }

  async checkIn(
    appointmentUid: string,
    personUid: string,
    agentId: string
  ): Promise<any> {
    const now = new Date().toISOString();
    return await new Promise((resolve, reject) => {
      this.db
        .collection(this.appConfig.appointmentsCollection)
        .updateOne(
          { appointmentUid },
          {
            $set: {
              lastModified: `${now}`,
              'persons.$[person].checkedInBy': agentId,
              'persons.$[person].checkedIn': true,
              'persons.$[person].status': 'checkedIn',
              'persons.$[person].checkedInAt': `${now}`,
            },
          },
          { arrayFilters: [{ 'person.uid': personUid }] }
        )
        .then((result) => {
          if (result.modifiedCount > 0) {
            this.socketEventsService.socket.emit(
              'appointments-update',
              'appointment-modified'
            );
          }
          resolve(result);
        });
    });
  }

  async getPDFResult(personUid: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db
        .collection(this.appConfig.settingsCollection)
        .findOne(
          {},
          {
            projection: {
              address: 1,
              city: 1,
              country: 1,
              postalCode: 1,
              name: 1,
            },
          }
        )
        .then((settings) => {
          this.db
            .collection(this.appConfig.appointmentsCollection)
            .aggregate([
              {
                $project: {
                  testType: 1,
                  appointment: 1,
                  person: {
                    $filter: {
                      input: '$persons',
                      as: 'person',
                      cond: {
                        $and: [
                          '$$person.testResult',
                          { $eq: ['$$person.status', 'testPerformed'] },
                          { $eq: ['$$person.uid', personUid] },
                        ],
                      },
                    },
                  },
                  appointmentUid: 1,
                  createDate: 1,
                  lastModified: 1,
                },
              },
              {
                $match: { person: { $gt: { $size: 0 } } },
              },
              { $limit: 1 },
              { $unwind: { path: '$person' } },
            ])
            .toArray()
            .then((data) => {
              if (data.length) {
                const testData = data[0];
                const person = testData.person;
                generateQRCode('test').then((qr) => {
                  generateTestResultPDF(
                    qr,
                    person.testResult,
                    person,
                    settings,
                    testData
                  ).then((qrPdf) => {
                    resolve(qrPdf);
                    // resolve({ pdf: qrPdf.toString('base64') });
                  });
                });
              }
            });
        });
    });
  }

  async cancelAppointment(
    appointmentUid: string,
    personUid: string[],
    agentId: string
  ): Promise<any> {
    const now = new Date().toISOString();
    return await new Promise((resolve, reject) => {
      this.db
        .collection(this.appConfig.appointmentsCollection)
        .updateOne(
          { appointmentUid },
          {
            $set: {
              lastModified: `${now}`,
              'persons.$[person].canceledBy': agentId,
              'persons.$[person].canceled': true,
              'persons.$[person].status': 'canceled',
              'persons.$[person].canceledAt': `${now}`,
            },
          },
          { arrayFilters: [{ 'person.uid': { $in: personUid } }] }
        )
        .then((result) => {
          if (result.modifiedCount > 0) {
            this.socketEventsService.socket.emit(
              'appointments-update',
              'appointment-canceled'
            );
          }
          if (agentId === 'user') {
            this.db
              .collection(this.appConfig.appointmentsCollection)
              .aggregate([
                { $match: { appointmentUid: appointmentUid } },
                {
                  $project: {
                    _id: 0,
                    appointment: 1,
                    persons: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$persons',
                            as: 'persons',
                            cond: {
                              $and: [
                                { $eq: ['$$persons.status', 'canceled'] },
                                {
                                  $in: ['$$persons.uid', personUid],
                                },
                              ],
                            },
                          },
                        },
                        as: 'person',
                        in: {
                          name: {
                            $concat: [
                              '$$person.firstName',
                              ' ',
                              '$$person.secondName',
                            ],
                          },
                          email: '$$person.email',
                        },
                      },
                    },
                  },
                },
              ])
              .next()
              .then((result) => {
                result.persons.forEach((person) => {
                  this.mailService.sendMail({
                    data: {
                      data: {
                        name: person.name,
                        appointment: format(
                          parseISO(result.appointment),
                          "dd.MM.yyyy 'um' HH:mm 'Uhr'"
                        ),
                      },
                    },
                    subject: 'Termin-Stornierung',
                    to: person.email,
                    template: 'cancelAppointmentMailTemplate.pug',
                  });
                });
                resolve({ ok: true });
              });
            // TODO-sned mail
          }
          // resolve(result);
        });
    });
  }

  async emitTestResult(
    host: string,
    appointmentUid: string,
    personUid: string,
    testResult: string,
    person: any,
    agentId: string,
    testData: any,
    testKit: string
  ): Promise<any> {
    return await new Promise((resolve, reject) => {
      const now = new Date().toISOString();

      return this.db
        .collection(this.appConfig.appointmentsCollection)
        .updateOne(
          { appointmentUid },
          {
            $currentDate: {
              lastModified: true,
            },
            $set: {
              'persons.$[person].resultEmittedBy': agentId,
              'persons.$[person].resultEmittedAt': `${now}`,
              'persons.$[person].testResult': testResult,
              'persons.$[person].status': 'testPerformed',
              'persons.$[person].testKit': testKit,
            },
          },
          { arrayFilters: [{ 'person.uid': personUid }] }
        )
        .then((result) => {
          if (result.modifiedCount > 0) {
            this.socketEventsService.socket.emit(
              'appointments-update',
              'appointment-modified'
            );
          }
          // resolve(result);
          this.db
            .collection(this.appConfig.settingsCollection)
            .findOne()
            .then((settings) => {
              generateQRCode('test').then((qr) => {
                generateTestResultPDF(
                  qr,
                  testResult,
                  person,
                  settings,
                  testData
                ).then((qrPdf) => {
                  this.mailService
                    .sendMail({
                      data: {
                        data: {
                          ...this.buildMailData({
                            host,
                            person,
                            settings,
                          }),
                        },
                      },
                      subject: `Ihr Testergebnis liegt vor (${person.email})`,
                      to: person.email,
                      template: 'testResultMailTemplate.pug',
                      attachments: [
                        { filename: 'test-result.pdf', content: qrPdf },
                      ],
                    })
                    .then(
                      (success) => {
                        resolve({ ok: true, data: qr });
                      },
                      (error) => {
                        reject({ ok: false, error });
                      }
                    );
                });
              });
              resolve(settings);
            });
        });
    });
  }

  async setSettings(data): Promise<any> {
    return await this.db
      .collection(this.appConfig.settingsCollection)
      .updateMany(
        {},
        {
          $set: { ...data },
        },
        { upsert: true }
      )
      .then((result) => {
        if (result.modifiedCount > 0) {
          this.socketEventsService.socket.emit(
            'settings-update',
            'settings-update'
          );
        }
        return result;
      });
  }

  async getSettings(): Promise<any> {
    return this.db
      .collection(this.appConfig.settingsCollection)
      .find()
      .toArray();
  }

  async addAgent(data): Promise<any> {
    const randomPsw = Math.random().toString(36).slice(-8);

    return new Promise((resolve, reject) => {
      this.db
        .collection(this.appConfig.loginCollection)
        .findOne({ $or: [{ userName: data.username }, { email: data.email }] })
        .then((agent) => {
          if (agent === null) {
            data.psw = crypto.createHash('md5').update(randomPsw).digest('hex');
            this.db
              .collection(this.appConfig.loginCollection)
              .insertOne(data)
              .then((result) => {
                this.socketEventsService.socket.emit(
                  'add-new-agent',
                  'add-agent'
                );
                const url = `https://${
                  this.appConfig.appDomain
                }/admin/login/first-login/${btoa(
                  encodeURI(
                    JSON.stringify({ userName: data.userName, psw: randomPsw })
                  )
                )}`;
                this.mailService
                  .sendMail({
                    data: {
                      data: { ...data, psw: randomPsw, url },
                    },
                    subject: 'New-Registration',
                    to: data.email,
                    template: 'newAgentMailTemplate.pug',
                  })
                  .then(() => {
                    resolve(result);
                  });
              });
          } else {
            resolve({
              ok: false,
              existedUsername: data.userName,
              existedEmail: data.email,
            });
          }
        });
    });
  }

  async updateAgent(id, data): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db
        .collection(this.appConfig.loginCollection)
        .updateOne({ _id: new ObjectId(id) }, { $set: data })
        .then(
          (onAccept) => {
            this.socketEventsService.socket.emit(
              'update-agent',
              'update-agent'
            );
            resolve({ ok: true, ...onAccept });
          },
          (error) => {
            reject({ ok: false, ...error });
          }
        );
    });
  }

  async getAgents(): Promise<any> {
    return await this.db
      .collection(this.appConfig.loginCollection)
      .find()
      .toArray();
  }

  async getClients(): Promise<any> {
    return await this.db
      .collection(this.appConfig.appointmentsCollection)
      .aggregate([
        {
          $project: {
            _id: 0,
            persons: 1,
          },
        },
        {
          $unwind: {
            path: '$persons',
          },
        },
        {
          $group: {
            _id: {
              firstName: '$persons.firstName',
              secondName: '$persons.secondName',
              birthDate: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: {
                    $dateFromString: {
                      dateString: '$persons.birthDate',
                    },
                  },
                },
              },
            },
            person: {
              $first: '$persons',
            },
          },
        },
        {
          $project: {
            _id: 0,
            country: '$person.country',
            birthDate: '$person.birthDate',
            firstName: '$person.firstName',
            secondName: '$person.secondName',
            email: '$person.email',
            email_repeat: '$person.email_repeat',
            telephone: '$person.telephone',
            city: '$person.city',
            address: '$person.address',
            postalCode: '$person.postalCode',
          },
        },
      ])
      .toArray();
  }

  async cwaTransmission(credentials, agreement, cwaPolicy): Promise<any> {
    try {
      const uid = decrypt(credentials, this.appConfig.cryptoKey);
      const cwaHost = this.appConfig.cwaHost;
      const now = new Date().toISOString();
      const salt = crypto.randomBytes(16).toString('hex').toUpperCase();
      return new Promise((resolve, reject) => {
        this.db
          .collection(this.appConfig.appointmentsCollection)
          .aggregate([
            { $match: { 'persons.uid': uid } },
            {
              $project: {
                _id: 0,
                appointmentUid: 1,
                appointment: 1,
                person: {
                  $filter: {
                    input: '$persons',
                    as: 'person',
                    cond: { $eq: ['$$person.uid', uid] },
                  },
                },
              },
            },
            { $unwind: { path: '$person' } },
          ])
          .limit(1)
          .next()
          .then((appointmentData) => {
            if (appointmentData) {
              const person = appointmentData.person;
              const timestamp = getUnixTime(
                parseISO(appointmentData.appointment)
              );
              let jsonObj: any = { timestamp, salt };

              const hash = buildCwaHash({
                agreement,
                person,
                jsonObj,
                timestamp,
                uid,
                salt,
              });
              this.emitCwaResult(cwaHost, hash, timestamp, person.testResult);
              const objB64url = convertToBase64Url(jsonObj);
              const cwaUrl = `https://s.coronawarn.app?v=1#${objB64url}`;
              generateQRCode(cwaUrl).then((cwaQr) => {
                this.db
                  .collection(this.appConfig.appointmentsCollection)
                  .updateOne(
                    { appointmentUid: appointmentData.appointmentUid },
                    {
                      $set: {
                        lastModified: `${now}`,
                        'persons.$[person].cwa': {
                          acceptedCwaPolicy: cwaPolicy,
                          agreement,
                          salt,
                          hash,
                          objJsonB64url: objB64url,
                          cwaQr,
                        },
                      },
                    },
                    { arrayFilters: [{ 'person.uid': uid }] }
                  )
                  .then((result) => {
                    resolve({
                      ok: true,
                      url: cwaUrl,
                      cwaQr,
                      jsonObj,
                      testResults: [
                        { id: hash, result: result, sc: timestamp },
                      ],
                    });
                  });
              });
            }
          });
      });
    } catch (exp) {
      console.log('error occured: ', exp);
      return exp;
    }
  }

  buildMailData({ host, person, settings }) {
    const warnAppUrl = `${host}/warnapp/${encodeURI(
      encrypt(person.uid, this.appConfig.cryptoKey)
    )}`;
    return {
      settings,
      person,
      warnAppUrl,
    };
  }

  async emitCwaResult(cwaHost, hash, timestamp, testResult): Promise<any> {
    return await new Promise((resolve, reject) => {
      try {
        const result =
          testResult === 'negative' ? 6 : testResult === 'positive' ? 7 : 8;
        const objToSend = {
          testResults: [{ id: hash, result: result, sc: timestamp }],
        };
        const options = {
          host: cwaHost,
          path: '/api/v1/quicktest/results',
          method: 'POST',
          port: '443',
          headers: { 'Content-Type': 'application/json' },
          cert: fs.readFileSync(this.appConfig.cwaCert),
          key: fs.readFileSync(this.appConfig.cwaWruKey),
          passphrase: this.appConfig.cwaPass,
          agent: false,
        };
        const req = https.request(options, function (res) {
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            console.log('DATA: ' + chunk);
            resolve(chunk);
          });
          res.on('error', function (error) {
            console.log('ERROR: ' + error);
            resolve(error);
          });
          res.on('end', function (tet) {
            console.log('END: ' + tet);
            resolve(tet);
          });
        });
        req.write(JSON.stringify(objToSend));
        req.end();
      } catch (exp) {
        console.log('error occured when emitCwaResult: ', exp);
        reject(exp);
      }
    });
  }
}
