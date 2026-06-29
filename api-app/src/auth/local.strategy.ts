/*************************************************************
 * api-app - local.strategy.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 26.01.22 - 18:04
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'username' });
  }

  async validate(username: string, password: string): Promise<any> {
    const client = await this.authService.validateClient(username, password);
    if (!client) {
      throw new UnauthorizedException();
    }
    return client;
  }
}
