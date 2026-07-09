import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { AppConfigService } from '../config/app-config/app-config.service';

describe('AuthService', () => {
  let service: AuthService;
  let storedUser: any;

  const findOne = jest.fn(() => Promise.resolve(storedUser));
  const db = { collection: jest.fn(() => ({ findOne })) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: { sign: () => 'signed-token' } },
        { provide: AppConfigService, useValue: { loginCollection: 'logins' } },
        { provide: 'MONGO-PROVIDER', useValue: db },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    findOne.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('accepts a correct password stored as a bcrypt hash', async () => {
    storedUser = {
      userName: 'admin',
      psw: bcrypt.hashSync('admin123', 10),
      active: true,
    };

    const result = await service.validateClient('admin', 'admin123');

    expect(result).toBe(storedUser);
  });

  it('rejects an incorrect password against a bcrypt hash', async () => {
    storedUser = {
      userName: 'admin',
      psw: bcrypt.hashSync('admin123', 10),
      active: true,
    };

    const result = await service.validateClient('admin', 'wrong-password');

    expect(result).toBeNull();
  });

  it('still accepts legacy MD5-hashed passwords (migration path)', async () => {
    storedUser = {
      userName: 'legacy',
      psw: crypto.createHash('md5').update('admin123').digest('hex'),
      active: true,
    };

    const result = await service.validateClient('legacy', 'admin123');

    expect(result).toBe(storedUser);
  });

  it('rejects inactive accounts even with a correct password', async () => {
    storedUser = {
      userName: 'admin',
      psw: bcrypt.hashSync('admin123', 10),
      active: false,
    };

    const result = await service.validateClient('admin', 'admin123');

    expect(result).toBeNull();
  });

  it('returns a token on successful login', async () => {
    storedUser = {
      userName: 'admin',
      psw: bcrypt.hashSync('admin123', 10),
      active: true,
      firstName: 'Demo',
      secondName: 'Admin',
      roles: ['admin'],
    };

    const result = await service.login({
      userName: 'admin',
      password: 'admin123',
    });

    expect(result).toEqual({ access_token: 'signed-token' });
  });
});
