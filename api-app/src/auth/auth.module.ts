import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AppConfigModule } from '../config/app-config/app-config.module';
import { MongoAppModule } from '../config/mongo-app/mongo-app.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { AppConfigService } from '../config/app-config/app-config.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, LocalAuthGuard, JwtStrategy],
  imports: [
    AppConfigModule,
    MongoAppModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: (appConf: AppConfigService) => ({
        secret: appConf.authJwtSecret,
        signOptions: { expiresIn: '60s' },
      }),
      inject: [AppConfigService],
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
