import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'agent')
@Controller('statistics')
export class StatisticsController {
  constructor(private statisticsServices: StatisticsService) {}

  @Get('appointments-by-date')
  getAppointmentsStatisticsByDate() {
    return this.statisticsServices.getAppointmentsStatisticsByDate();
  }
}
