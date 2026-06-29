import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { AdministrationService } from './administration.service';

@Controller('admin')
export class AdministrationController {
  constructor(private readonly administrationService: AdministrationService) {}

  @Get('/appointments')
  async login(@Request() req, @Query() query) {
    return this.administrationService.findAppointments(query);
  }

  @Post('/appointments/checkIns')
  async checkin(@Body() data) {
    return this.administrationService.checkIn(
      data.appointmentId,
      data.personUid,
      data.agentId
    );
  }

  @Post('/appointments/pdf-result-for-print')
  async getPDFResult(@Body() data) {
    return this.administrationService.getPDFResult(data.personUid);
  }

  @Post('/appointments/cancel')
  async cancelAppointment(@Body() data) {
    return this.administrationService.cancelAppointment(
      data.appointmentId,
      data.personUid,
      data.agentId
    );
  }

  @Get('/settings')
  async getSettings() {
    return this.administrationService.getSettings();
  }

  @Post('/settings')
  async setSettings(@Body() data) {
    return this.administrationService.setSettings(data);
  }

  @Post('/emit-result')
  async emitTestResult(@Request() request, @Body() data) {
    const { host, protocol } = new URL(request.headers.referer);
    return this.administrationService.emitTestResult(
      protocol + '//' + host,
      data.appointmentUid,
      data.uid,
      data.testResult,
      data.person,
      data.agentId,
      data.testData,
      data.testKit
    );
  }

  @Put('/add-agent')
  async addAgent(@Body() data) {
    return this.administrationService.addAgent(data);
  }

  @Post('/update-agent')
  async updateAgent(@Body() data) {
    return this.administrationService.updateAgent(data.id, data.data);
  }

  @Get('/agents')
  async getAgents() {
    return this.administrationService.getAgents();
  }

  @Get('/clients')
  async getClients() {
    return this.administrationService.getClients();
  }

  @Post('/cwa-transmission')
  async cwaTransmission(@Body() data) {
    return this.administrationService.cwaTransmission(
      data.credentials,
      data.agreementType,
      data.cwaPolicy
    );
  }
}
