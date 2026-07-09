/*************************************************************
 * api-app - jwt.strategy.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 26.01.22 - 18:02
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from '../config/app-config/app-config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private appConfig: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.authJwtSecret,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.id,
      username: payload.username,
      roles: payload.roles ?? [],
    };
  }
}
