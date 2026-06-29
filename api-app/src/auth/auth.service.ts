import { Inject, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Db } from 'mongodb';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../config/app-config/app-config.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private appConfig: AppConfigService,
    private jwtService: JwtService,
    @Inject('MONGO-PROVIDER') private db: Db
  ) {}

  async validateClient(username: string, pass: string): Promise<any> {
    return this.db
      .collection(this.appConfig.loginCollection)
      .findOne(
        { $or: [{ userName: username }, { email: username }] },
        { projection: { repeatPassword: 0 } }
      )
      .then((user) => {
        if (user && user.psw === pass && user.active !== false) {
          return user;
        }
        return null;
      });
  }

  async login(user: any): Promise<any> {
    return this.validateClient(
      user.userName,
      crypto.createHash('md5').update(user.password).digest('hex')
    ).then((result) => {
      if (result !== null) {
        const payload = {
          username: result.userName,
          fullName: result.firstName + ' ' + result.secondName,
          email: result.email,
          id: result._id,
          roles: result.roles,
        };
        return { access_token: this.jwtService.sign(payload) };
      }
      return { ok: true, error: 'credentialNotMatched' };
    });
  }

  async signup(login: CreateAuthDto): Promise<void> {
    await this.db.collection('logins').insertOne(login);
  }
}
