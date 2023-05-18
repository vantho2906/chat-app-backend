import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class MyGateway {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Connected');
    });
  }

  @SubscribeMessage('send-msg')
  onNewMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    console.log(body);
    this.server.emit('on-msg', {
      from: client.id,
      content: body,
    });
  }
}
