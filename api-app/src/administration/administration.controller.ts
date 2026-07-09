import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdministrationService } from './administration.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// Operational endpoints are open to any signed-in staff member; agent
// management and settings changes are restricted to administrators. Reading
// center settings stays public because the booking flow needs it.
@Controller('admin')
export class AdministrationController {
  constructor(private readonly administrationService: AdministrationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
  @Get('/appointments')
  async login(@Request() req, @Query() query) {
    return this.administrationService.findAppointments(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
  @Post('/appointments/checkIns')
  async checkin(@Body() data) {
    return this.administrationService.checkIn(
      data.appointmentId,
      data.personUid,
      data.agentId
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
  @Post('/appointments/pdf-result-for-print')
  async getPDFResult(@Body() data) {
    return this.administrationService.getPDFResult(data.personUid);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('/settings')
  async setSettings(@Body() data) {
    return this.administrationService.setSettings(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('/add-agent')
  async addAgent(@Body() data) {
    return this.administrationService.addAgent(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('/update-agent')
  async updateAgent(@Body() data) {
    return this.administrationService.updateAgent(data.id, data.data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
  @Get('/agents')
  async getAgents() {
    return this.administrationService.getAgents();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
  @Get('/clients')
  async getClients() {
    return this.administrationService.getClients();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
  @Post('/cwa-transmission')
  async cwaTransmission(@Body() data) {
    return this.administrationService.cwaTransmission(
      data.credentials,
      data.agreementType,
      data.cwaPolicy
    );
  }
}
