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
import { ChatRoom } from 'chat-rooms/entities/chat-room.entity';
import { ChatRoomTypeEnum } from 'etc/enums';
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
      const room = await this.messageService.getRoomByMsgId(msgId);
      this.io.in(room.id.toString()).emit('receive-recall-msg', data);
    }
  }

  @SubscribeMessage('send-msg')
  async sendMsg(
    @ConnectedSocket() client: Socket,
    @MessageBody('msgId') msgId: number,
  ) {
    const msg = await this.messageService.getMsgWithSenderAndRoomAndFiles(
      msgId,
    );
    if (!msg) {
      client.emit('exception', 'Failed to send msg! Message not found');
    } else {
      this.io.in(msg.room.id.toString()).emit('receive-send-msg', msg);
    }
  }

  @SubscribeMessage('edit-msg')
  async editMsgText(
    @ConnectedSocket() client: Socket,
    @MessageBody('msgId') msgId: number,
    @MessageBody('text') text: string,
  ) {
    const [msg, err] = await this.messageService.editMsgText(
      client.data.account,
      msgId,
      text,
    );
    if (err) {
      client.emit('exception', err);
    } else {
      this.io
        .in((msg as Message).room.id.toString())
        .emit('receive-edit-msg', msg);
    }
  }

  @SubscribeMessage('delete-room')
  async deleteRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: number,
  ) {
    const [notification, err] = await this.chatRoomsService.deleteRoom(
      client.data.account,
      roomId,
    );
    if (err) {
      client.emit('exception', err);
    } else {
      this.io.in(roomId.toString()).emit('receive-delete-room', notification);
    }
  }

  @SubscribeMessage('create-room')
  async createRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('memberIDsAdded') memberIDsAdded: string[],
    @MessageBody('type') type: ChatRoomTypeEnum,
  ) {
    const [room, err] = await this.chatRoomsService.createRoom(
      client.data.account,
      memberIDsAdded,
      type,
    );
    if (err) {
      client.emit('exception', err);
    } else {
      for (const memberID of memberIDsAdded) {
        this.io
          .in(memberID)
          .emit('receive-create-room', { roomId: (room as ChatRoom).id });
      }
    }
  }

  @SubscribeMessage('join-room')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: number,
  ) {
    client.join(roomId.toString());
  }

  @SubscribeMessage('leave-room')
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: number,
  ) {
    const [msg, err] = await this.chatRoomsService.leaveRoom(
      client.data.account,
      roomId,
    );
    if (err) {
      client.emit('exception', err);
    } else {
      if (msg != true) client.to(roomId.toString()).emit('msg', msg);
    }
  }
}
