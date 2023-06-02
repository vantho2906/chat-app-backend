import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AccountsService } from 'accounts/accounts.service';
import { Account } from 'accounts/entities/account.entity';
import { ChatRoomsService } from 'chat-rooms/chat-rooms.service';
import { Message } from 'messages/entities/message.entity';
import { Notification } from 'notifications/entities/notification.entity';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';

@WebSocketGateway(80, { cors: true })
@Injectable()
export class MyGateway {
  constructor(
    private onlineUsers: Map<string, string[]>,
    private onlineUsersReverse: Map<string, string>,

    private readonly chatRoomsService: ChatRoomsService,

    private readonly accountsService: AccountsService,

    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {
    this.onlineUsers = new Map();
    this.onlineUsersReverse = new Map();
  }

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    const onlineUsers = this.onlineUsers;
    const onlineUsersReverse = this.onlineUsersReverse;
    const accountsService = this.accountsService;
    const accountsRepository = this.accountsRepository;
    this.server.on('connection', (socket: Socket) => {
      console.log(socket.id);
      console.log('Connected');

      socket.on('disconnect', async function () {
        if (onlineUsersReverse[socket.id]) {
          const accountId: string = onlineUsersReverse[socket.id];
          onlineUsers[accountId] = (onlineUsers[accountId] as string[]).filter(
            (socketID) => {
              return socketID != socket.id;
            },
          );
          delete onlineUsersReverse[socket.id];
          if (!(onlineUsers[accountId] as string[]).length) {
            const account = await accountsService.getById(accountId);
            if (!account) {
              socket.emit('login-fail', 'Account not found');
              return;
            }
            account.offlineAt = new Date();
            accountsRepository.save(account);
          }
        }
        console.log(socket.id + ' disconnected');
      });
    });
  }

  @SubscribeMessage('login')
  async login(
    @ConnectedSocket() client: Socket,
    @MessageBody() accountId: string,
  ) {
    const account = await this.accountsService.getById(accountId);
    if (!account) {
      client.emit('login-fail', 'Account not found');
      return;
    }
    const [rooms, err] = await this.chatRoomsService.getAllRooms(account);
    // join rooms
    const roomIds = rooms.map((room) => room.id.toString());
    client.join(roomIds);
    if (!this.onlineUsers[accountId]) this.onlineUsers[accountId] = [];
    (this.onlineUsers[accountId] as string[]).push(client.id);
    this.onlineUsersReverse[client.id] = accountId;
  }

  @SubscribeMessage('send-msg')
  newMsg(@ConnectedSocket() client: Socket, @MessageBody() msg: Message) {
    client.to(msg.room.id.toString()).emit('on-send', {
      content: msg,
    });
  }

  @SubscribeMessage('edit-msg')
  editMsg(@ConnectedSocket() client: Socket, @MessageBody() msg: Message) {
    client.to(msg.room.id.toString()).emit('on-edit', {
      content: msg,
    });
  }

  @SubscribeMessage('recall-msg')
  recallMsg(@ConnectedSocket() client: Socket, @MessageBody() msg: Message) {
    client.to(msg.room.id.toString()).emit('on-recall', {
      content: msg,
    });
  }

  @SubscribeMessage('send-notification')
  sendNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() notification: Notification,
  ) {
    for (const endUser of notification.endUsers) {
      this.server
        .to(this.onlineUsers[endUser.receiver.id])
        .emit('on-send-noti', {
          content: notification,
        });
    }
  }
}
