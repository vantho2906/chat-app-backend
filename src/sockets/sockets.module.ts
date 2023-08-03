import { Module } from '@nestjs/common';
import { ChatRoomsModule } from 'chat-rooms/chat-rooms.module';
import { AccountsModule } from 'accounts/accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'accounts/entities/account.entity';
import { SocketsGateway } from './sockets.gateway';
import { FriendRequestsModule } from 'friend-requests/friend-requests.module';
import { MembersModule } from 'members/members.module';
import { MessagesModule } from 'messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    ChatRoomsModule,
    FriendRequestsModule,
    AccountsModule,
    MembersModule,
    MessagesModule,
  ],
  providers: [SocketsGateway, Map],
})
export class SocketModule {}
