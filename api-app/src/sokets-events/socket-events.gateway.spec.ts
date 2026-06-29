import { Test, TestingModule } from '@nestjs/testing';
import { SocketEventsGateway } from './socket-events.gateway';

describe('SoketsEventsGateway', () => {
  let gateway: SocketEventsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketEventsGateway],
    }).compile();

    gateway = module.get<SocketEventsGateway>(SocketEventsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
