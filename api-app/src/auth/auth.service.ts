import { Inject, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Db } from 'mongodb';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../config/app-config/app-config.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private appConfig: AppConfigService,
    private jwtService: JwtService,
    @Inject('MONGO-PROVIDER') private db: Db
  ) {}

  async validateClient(username: string, plainPassword: string): Promise<any> {
    return this.db
      .collection(this.appConfig.loginCollection)
      .findOne(
        { $or: [{ userName: username }, { email: username }] },
        { projection: { repeatPassword: 0 } }
      )
      .then(async (user) => {
        if (
          user &&
          user.active !== false &&
          (await this.verifyPassword(plainPassword, user.psw))
        ) {
          return user;
        }
        return null;
      });
  }

  /**
   * Verifies a plaintext password against the stored hash. Prefers bcrypt and
   * falls back to the legacy MD5 scheme so pre-migration accounts keep working
   * until their next password change.
   */
  private async verifyPassword(
    plainPassword: string,
    storedHash: string
  ): Promise<boolean> {
    if (!plainPassword || !storedHash) {
      return false;
    }
    if (storedHash.startsWith('$2')) {
      return bcrypt.compare(plainPassword, storedHash);
    }
    const legacyHash = crypto
      .createHash('md5')
      .update(plainPassword)
      .digest('hex');
    return storedHash === legacyHash;
  }

  async login(user: any): Promise<any> {
    return this.validateClient(user.userName, user.password).then((result) => {
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
