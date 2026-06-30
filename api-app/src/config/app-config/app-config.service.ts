/*************************************************************
 * api-app - app-config.service.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 20.01.22 - 23:02
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppConfigService {
  private readonly _appDomain!: string;
  private readonly _appPort!: string;
  private readonly _appName!: string;
  private readonly _appEnv!: string;
  private readonly _mongoDBConnection!: string;
  private readonly _mongoDBName!: string;
  private readonly _mailHost!: string;
  private readonly _mailPort!: number;
  private readonly _mailSecure!: boolean;
  private readonly _mailUser!: string;
  private readonly _mailPwd!: string;
  private readonly _authJwtSecret!: string;
  private readonly _loginCollection!: string;
  private readonly _appointmentsCollection!: string;
  private readonly _settingsCollection!: string;
  private readonly _cryptoKey!: string;
  private readonly _cwaHost!: string;
  private readonly _cwaWruKey!: string;
  private readonly _cwaCert!: string;
  private readonly _cwaPass!: string;

  get mongoDBConnection(): string {
    return this._mongoDBConnection;
  }

  get mongoDBName(): string {
    return this._mongoDBName;
  }

  get appDomain(): string {
    return this._appDomain;
  }

  get appPort(): string {
    return this._appPort;
  }

  get appName(): string {
    return this._appName;
  }

  get appEnv(): string {
    return this._appEnv;
  }

  get mailHost(): string {
    return this._mailHost;
  }

  get mailPort(): number {
    return this._mailPort;
  }

  get mailSecure(): boolean {
    return this._mailSecure;
  }

  get mailUser(): string {
    return this._mailUser;
  }

  get mailPwd(): string {
    return this._mailPwd;
  }

  get authJwtSecret(): string {
    return this._authJwtSecret;
  }

  get loginCollection(): string {
    return this._loginCollection;
  }

  get appointmentsCollection(): string {
    return this._appointmentsCollection;
  }

  get settingsCollection(): string {
    return this._settingsCollection;
  }

  get cryptoKey(): string {
    return this._cryptoKey;
  }

  get cwaHost(): string {
    return this._cwaHost;
  }

  get cwaWruKey(): string {
    return this._cwaWruKey;
  }

  get cwaCert(): string {
    return this._cwaCert;
  }

  get cwaPass(): string {
    return this._cwaPass;
  }

  constructor(private readonly _configService: ConfigService) {
    this._appDomain = this._getAppDomainFromEnv();
    this._appPort = this._getAppPortFromEnv();
    this._appName = this._getAppNameFromEnv();
    this._appEnv = this._getAppEnvFromEnv();
    this._mongoDBConnection = this._getMongoDBConnectionFromEnv();
    this._mongoDBName = this._getMongoDBNameFromEnv();
    this._mailHost = this._getMailHostFromEnv();
    this._mailPort = this._getMailPortFromEnv();
    this._mailSecure = this._getMailSecureFromEnv();
    this._mailUser = this._getMailUserFromEnv();
    this._mailPwd = this._getMailPwdFromEnv();
    this._authJwtSecret = this._getAuthJwtSecret();
    this._loginCollection = this._getLoginCollection();
    this._appointmentsCollection = this._getAppointmentsCollection();
    this._settingsCollection = this._getSettingsCollection();
    this._cryptoKey = this._getCryptoKey();
    this._cwaHost = this._getCwaHost();
    this._cwaWruKey = this._getCwaWruKey();
    this._cwaCert = this._getCwaCert();
    this._cwaPass = this._getCwaPass();
  }

  private _getMongoDBConnectionFromEnv(): string {
    const mongoDBHost = this._configService.get<string>('DB_HOST');
    const mongoDBPort = this._configService.get<string>('DB_PORT');
    const mongoDBName = this._configService.get<string>('DB_NAME');
    const mongoDBUser = this._configService.get<string>('DB_USER');
    const mongoDBNPwd = this._configService.get<string>('DB_PWD');

    if (!mongoDBHost) {
      throw new Error(
        'No db connection attribute has been provided in the .env file.'
      );
    }

    return (
      'mongodb://' +
      (mongoDBUser ? atob(mongoDBUser) + ':' : '') +
      (mongoDBNPwd ? atob(mongoDBNPwd) + '@' : '') +
      mongoDBHost +
      ':' +
      mongoDBPort +
      '/' +
      mongoDBName
    );
  }

  private _getMongoDBNameFromEnv(): string {
    const mongoDBName = this._configService.get<string>('DB_NAME');
    if (!mongoDBName) {
      throw new Error(
        'No db name attribute has been provided in the .env file.'
      );
    }
    return mongoDBName;
  }

  private _getAppDomainFromEnv(): string {
    const appDomain = this._configService.get<string>('APP_DOMAIN');
    if (!appDomain) {
      throw new Error(
        'No app domain attribute has been provided in the .env file.'
      );
    }
    return appDomain;
  }

  private _getAppPortFromEnv(): string {
    const appPort = this._configService.get<string>('NODE_PORT');
    if (!appPort) {
      throw new Error(
        'No app port attribute has been provided in the .env file.'
      );
    }
    return appPort;
  }

  private _getAppNameFromEnv(): string {
    const appName = this._configService.get<string>('APP_NAME');
    if (!appName) {
      throw new Error(
        'No app name attribute has been provided in the .env file.'
      );
    }
    return appName;
  }

  private _getAppEnvFromEnv(): string {
    const appEnv = this._configService.get<string>('NODE_ENV');
    if (!appEnv) {
      throw new Error(
        'No app env attribute has been provided in the .env file.'
      );
    }
    return appEnv;
  }

  private _getMailHostFromEnv(): string {
    const mailHost = this._configService.get<string>('MAIL_HOST');
    if (!mailHost) {
      throw new Error(
        'No mailHost env attribute has been provided in the .env file.'
      );
    }
    return mailHost;
  }

  private _getMailPortFromEnv(): number {
    const mailPort = this._configService.get<string>('MAIL_PORT') || '465';
    return Number(mailPort);
  }

  private _getMailSecureFromEnv(): boolean {
    const mailSecure = this._configService.get<string>('MAIL_SECURE');
    return mailSecure === undefined ? true : mailSecure === 'true';
  }

  private _getMailUserFromEnv(): string {
    const mailUser = this._configService.get<string>('MAIL_USER');
    if (!mailUser) {
      throw new Error(
        'No mailUser env attribute has been provided in the .env file.'
      );
    }
    return mailUser;
  }

  private _getMailPwdFromEnv(): string {
    const mailPwd = this._configService.get<string>('MAIL_PWD');
    if (!mailPwd) {
      throw new Error(
        'No mailPwd env attribute has been provided in the .env file.'
      );
    }
    return mailPwd;
  }

  private _getAuthJwtSecret(): string {
    const jwtSecret = this._configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error(
        'No jwtSecret env attribute has been provided in the .env file.'
      );
    }
    return jwtSecret;
  }

  private _getLoginCollection(): string {
    const loginCollection = this._configService.get<string>('COLLECTION_LOGIN');
    if (!loginCollection) {
      throw new Error(
        'No loginCollection env attribute has been provided in the .env file.'
      );
    }
    return loginCollection;
  }

  private _getAppointmentsCollection(): string {
    const appointmentsCollection = this._configService.get<string>(
      'COLLECTION_APPOINTMENTS'
    );
    if (!appointmentsCollection) {
      throw new Error(
        'No appointmentsCollection env attribute has been provided in the .env file.'
      );
    }
    return appointmentsCollection;
  }

  private _getSettingsCollection(): string {
    const settingsCollection = this._configService.get<string>(
      'COLLECTION_SETTINGS'
    );
    if (!settingsCollection) {
      throw new Error(
        'No settingsCollection env attribute has been provided in the .env file.'
      );
    }
    return settingsCollection;
  }

  private _getCryptoKey(): string {
    const cryptoKey = this._configService.get<string>('CRYPTO_KEY');
    if (!cryptoKey) {
      throw new Error(
        'No cryptoKey env attribute has been provided in the .env file.'
      );
    }
    return cryptoKey;
  }

  private _getCwaHost(): string {
    const cwaHost = this._configService.get<string>('CWA_HOST');
    if (!cwaHost) {
      throw new Error(
        'No cwaHost env attribute has been provided in the .env file.'
      );
    }
    return cwaHost;
  }

  private _getCwaWruKey(): string {
    const cwaWruKey = this._configService.get<string>('CWA_WRU_KEY');
    if (!cwaWruKey) {
      throw new Error(
        'No cwaWruKey env attribute has been provided in the .env file.'
      );
    }
    return cwaWruKey;
  }

  private _getCwaCert(): string {
    const cwaCert = this._configService.get<string>('CWA_CERT');
    if (!cwaCert) {
      throw new Error(
        'No cwaCert env attribute has been provided in the .env file.'
      );
    }
    return cwaCert;
  }

  private _getCwaPass(): string {
    const cwaPass = this._configService.get<string>('CWA_PASS');
    if (!cwaPass) {
      throw new Error(
        'No cwaPass env attribute has been provided in the .env file.'
      );
    }
    return cwaPass;
  }
}
