import { Test, TestingModule } from '@nestjs/testing';
import { RequestQrService } from './request-qr.service';

describe('RequestQrService', () => {
  let service: RequestQrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestQrService],
    }).compile();

    service = module.get<RequestQrService>(RequestQrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
