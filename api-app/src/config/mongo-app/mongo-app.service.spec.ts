import { Test, TestingModule } from '@nestjs/testing';
import { MongoAppService } from './mongo-app.service';

describe('MongoAppService', () => {
  let service: MongoAppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MongoAppService],
    }).compile();

    service = module.get<MongoAppService>(MongoAppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
