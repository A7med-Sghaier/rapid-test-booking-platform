import { Test, TestingModule } from '@nestjs/testing';
import { RequestQrController } from './request-qr.controller';
import { RequestQrService } from './request-qr.service';

describe('RequestQrController', () => {
  let controller: RequestQrController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestQrController],
      providers: [{ provide: RequestQrService, useValue: {} }],
    }).compile();

    controller = module.get<RequestQrController>(RequestQrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
