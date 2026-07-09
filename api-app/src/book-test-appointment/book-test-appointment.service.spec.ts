import { Test, TestingModule } from '@nestjs/testing';
import { BookTestAppointmentService } from './book-test-appointment.service';
import { AppConfigService } from '../config/app-config/app-config.service';
import { MailService } from '../config/mail-config/mail.service';
import { SocketEventsService } from '../sokets-events/socket-events.service';

describe('BookTestAppointmentService', () => {
  let service: BookTestAppointmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookTestAppointmentService,
        { provide: 'MONGO-PROVIDER', useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: AppConfigService, useValue: {} },
        { provide: SocketEventsService, useValue: {} },
      ],
    }).compile();

    service = module.get<BookTestAppointmentService>(BookTestAppointmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
