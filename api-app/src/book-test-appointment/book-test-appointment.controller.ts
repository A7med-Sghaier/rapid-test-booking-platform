import { Body, Controller, Get, Param, Put, Request } from '@nestjs/common';
import { BookTestAppointmentService } from './book-test-appointment.service';
import { generateQRCode } from '../utils/qr-code';

@Controller('book-test-appointment')
export class BookTestAppointmentController {
  constructor(
    private readonly bookTestAppointmentService: BookTestAppointmentService
  ) {}

  @Put()
  createTestAppointment(@Request() request, @Body() appointmentData) {
    const { host, protocol } = new URL(request.headers.referer);
    return this.bookTestAppointmentService.createTestAppointment(
      protocol + '//' + host,
      appointmentData
    );
  }

  @Get('/booked-slots')
  getBookedSlots(@Request() request) {
    return this.bookTestAppointmentService.getBookedSlots();
  }
}
