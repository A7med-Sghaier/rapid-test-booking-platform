import { Test, TestingModule } from '@nestjs/testing';
import { BookTestAppointmentController } from './book-test-appointment.controller';
import { BookTestAppointmentService } from './book-test-appointment.service';

describe('BookTestAppointmentController', () => {
  let controller: BookTestAppointmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookTestAppointmentController],
      providers: [BookTestAppointmentService],
    }).compile();

    controller = module.get<BookTestAppointmentController>(BookTestAppointmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
