import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { AppConfigService } from '../config/app-config/app-config.service';
import { SocketEventsService } from '../sokets-events/socket-events.service';

describe('StatisticsService', () => {
  let service: StatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        { provide: 'MONGO-PROVIDER', useValue: {} },
        { provide: AppConfigService, useValue: {} },
        { provide: SocketEventsService, useValue: {} },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
