import { Test, TestingModule } from '@nestjs/testing';
import { AdministrationService } from './administration.service';
import { AppConfigService } from '../config/app-config/app-config.service';
import { MailService } from '../config/mail-config/mail.service';
import { SocketEventsService } from '../sokets-events/socket-events.service';

describe('AdministrationService', () => {
  let service: AdministrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdministrationService,
        { provide: AppConfigService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: SocketEventsService, useValue: {} },
        { provide: 'MONGO-PROVIDER', useValue: {} },
      ],
    }).compile();

    service = module.get<AdministrationService>(AdministrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
