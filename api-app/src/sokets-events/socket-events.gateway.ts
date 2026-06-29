import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketEventsService } from './socket-events.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketEventsGateway {
  constructor(private socketService: SocketEventsService) {}

  @WebSocketServer() public server: Server;
  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.socketService.socket = server;
  }
}
