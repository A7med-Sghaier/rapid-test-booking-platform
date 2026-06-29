import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { RequestQrService } from './request-qr.service';

@Controller('request-qr')
export class RequestQrController {
  constructor(private readonly requestQrService: RequestQrService) {}

  @Post()
  getBookingPersonsByEmail(@Request() request, @Body() data) {
    const { host, protocol } = new URL(request.headers.referer);

    return this.requestQrService.getBookingPersonsByEmail(
      protocol + '//' + host,
      data.email
    );
  }
}
