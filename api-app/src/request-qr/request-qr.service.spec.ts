import { Test, TestingModule } from '@nestjs/testing';
import { RequestQrService } from './request-qr.service';
import { MailService } from '../config/mail-config/mail.service';

describe('RequestQrService', () => {
  let service: RequestQrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestQrService,
        { provide: 'MONGO-PROVIDER', useValue: {} },
        { provide: MailService, useValue: {} },
      ],
    }).compile();

    service = module.get<RequestQrService>(RequestQrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
