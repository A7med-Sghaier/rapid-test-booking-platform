import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private statisticsServices: StatisticsService) {}

  @Get('appointments-by-date')
  getAppointmentsStatisticsByDate() {
    return this.statisticsServices.getAppointmentsStatisticsByDate();
  }
}
