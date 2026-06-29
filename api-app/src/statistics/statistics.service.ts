import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { AppConfigService } from '../config/app-config/app-config.service';
import { SocketEventsService } from '../sokets-events/socket-events.service';

@Injectable()
export class StatisticsService {
  constructor(
    @Inject('MONGO-PROVIDER') private db: Db,
    private appConfigService: AppConfigService,
    private socketEventsService: SocketEventsService
  ) {}

  async getAppointmentsStatisticsByDate(): Promise<any> {
    return await this.db
      .collection(this.appConfigService.appointmentsCollection)
      .aggregate([
        {
          $project: {
            _id: 0,
            appointment: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: {
                  $dateFromString: {
                    dateString: '$appointment',
                  },
                },
              },
            },
            personsCount: {
              $size: {
                $filter: {
                  input: '$persons',
                  as: 'persons',
                  cond: { $ne: ['$$persons.status', 'canceled'] },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: '$appointment',
            count: {
              $sum: '$personsCount',
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            count: 1,
          },
        },
      ])
      .toArray();
  }
}
