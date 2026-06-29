import { Global, Module } from '@nestjs/common';
import { SocketEventsGateway } from './socket-events.gateway';
import { SocketEventsService } from './socket-events.service';

@Global()
@Module({
  exports: [SocketEventsService],
  providers: [SocketEventsGateway, SocketEventsService],
})
export class SocketEventsModule {}
