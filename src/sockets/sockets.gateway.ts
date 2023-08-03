import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AccountsService } from 'accounts/accounts.service';
import { Account } from 'accounts/entities/account.entity';
import { ChatRoomsService } from 'chat-rooms/chat-rooms.service';
import { FriendRequest } from 'friend-requests/entities/friendRequest.entity';
import { FriendRequestsService } from 'friend-requests/friend-requests.service';
import { MembersService } from 'members/members.service';
import { Message } from 'messages/entities/message.entity';
import { MessagesService } from 'messages/messages.service';
import { Notification } from 'notifications/entities/notification.entity';
import { Namespace, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'polls' })
export class SocketsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private onlineUsers: Map<string, string[]> = new Map();
  private onlineUsersReverse: Map<string, string> = new Map();
  private readonly logger = new Logger(SocketsGateway.name);
  @WebSocketServer() io: Namespace;
  constructor(
    private readonly accountsService: AccountsService,
    private readonly chatRoomsService: ChatRoomsService,
    private readonly friendRequestsService: FriendRequestsService,
    private readonly membersService: MembersService,
    private readonly messageService: MessagesService,
  ) {}
  afterInit() {
    this.logger.log('Init SocketsGateway');
  }
  async handleConnection(client: Socket) {
    const sockets = this.io.sockets;
    const account: Account = client.data.account;
    if (!this.onlineUsers[account.id]) {
      this.onlineUsers[account.id] = [];
    }
    (this.onlineUsers[account.id] as string[]).push(client.id);
    const [rooms, err] = await this.chatRoomsService.getAllRooms(account);
    const roomIds = rooms.map((room) => {
      return room.id.toString();
    });
    client.join([...roomIds, account.id]);
    this.logger.log(`Client connected: ${client.id} - ${account.email}`);
    this.logger.log(`Number of clients: ${sockets.size}`);
  }

  handleDisconnect(client: Socket) {
    const sockets = this.io.sockets;
    if (this.onlineUsers[client.id]) {
      const accountId = this.onlineUsersReverse[client.id];
      this.onlineUsers[accountId] = (
        this.onlineUsers[accountId] as string[]
      ).filter((clientId) => {
        return clientId != client.id;
      });
      delete this.onlineUsersReverse[client.id];
      if (!(this.onlineUsers[accountId] as string[]).length) {
        this.accountsService.updateTimeOffline(accountId);
      }
    }
    this.logger.debug(`Client disconnected: ${client.id}`);
    this.logger.log(`Number of clients: ${sockets.size}`);
  }

  @SubscribeMessage('send-friend-request')
  async sendFriendRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody('receiverId') receiverId: string,
  ) {
    const [data, err] = await this.friendRequestsService.sendFriendRequest(
      client.data.account.id,
      receiverId,
    );
    if (err) {
      client.emit('exception', err);
    } else {
      this.io
        .in(receiverId)
        .emit('receive-friend-request', data as FriendRequest);
    }
  }

  @SubscribeMessage('cancel-friend-request')
  async cancelFriendRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody('opponentId') opponentId: string,
  ) {
    const [data, err] = await this.friendRequestsService.cancelFriendRequest(
      client.data.account.id,
      opponentId,
    );
    if (err) {
      client.emit('exception', err);
    } else {
      this.io
        .in(opponentId)
        .emit('receive-cancel-friend-request', data as FriendRequest);
    }
  }

  @SubscribeMessage('add-user-to-room')
  async addUsersToRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: number,
    @MessageBody('targetAccountId') targetAccountId: string,
  ) {
    const [data, err] = await this.membersService.addMember(
      client.data.account,
      roomId,
      targetAccountId,
    );
    if (err) {
      client.emit('exception', err);
    } else {
      if (data == true) {
        client.emit('exception', 'Waiting for approval');
      } else {
        const notification = data as Notification;
        if (notification.content) {
          const adminAndViceIds = notification.endUsers.map((endUser) => {
            return endUser.receiver.id;
          });
          this.io.in(adminAndViceIds).emit('notification', notification);
        } else {
          this.io.in(roomId.toString()).emit('msg', data);
        }
      }
    }
  }

  @SubscribeMessage('kick-user')
  async kickUser(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: number,
    @MessageBody('targetAccountId') targetAccountId: string,
  ) {
    const [data, err] = await this.membersService.kickMember(
      client.data.account,
      roomId,
      targetAccountId,
    );
    if (err) {
      client.emit('exception', err);
    } else {
      this.io.in(roomId.toString()).emit('msg', data);
    }
  }

  @SubscribeMessage('recall-msg')
  async recallMsg(
    @ConnectedSocket() client: Socket,
    @MessageBody('msgId') msgId: number,
  ) {
    const [data, err] = await this.messageService.recallMsg(
      client.data.account,
      msgId,
    );
    if (err) {
      client.emit('exception', err);
    } else {
      this.io
        .in((data as Message).room.id.toString())
        .emit('receive-recall-msg', data);
    }
  }
}
