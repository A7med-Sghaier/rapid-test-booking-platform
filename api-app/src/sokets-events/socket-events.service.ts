/*************************************************************
 * api-app - socket-events.service.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 29.01.22 - 22:17
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketEventsService {
  public socket: Server = null;
}
