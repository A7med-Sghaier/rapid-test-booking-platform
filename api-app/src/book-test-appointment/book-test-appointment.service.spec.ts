import { Test, TestingModule } from '@nestjs/testing';
import { BookTestAppointmentService } from './book-test-appointment.service';

describe('BookTestAppointmentService', () => {
  let service: BookTestAppointmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookTestAppointmentService],
    }).compile();

    service = module.get<BookTestAppointmentService>(BookTestAppointmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
