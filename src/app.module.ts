import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from './accounts/accounts.module';
import { NetworkFilesModule } from './network-files/network-files.module';
import { ChatRoomsModule } from './chat-rooms/chat-rooms.module';
import { MembersModule } from './members/members.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { FriendRequestsModule } from './friend-requests/friend-requests.module';
import { ReactsModule } from './reacts/reacts.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { OtpsModule } from './otps/otps.module';
import { GoogleApiModule } from './google-api/google-api.module';
import ChatAppDataSource from './database/datasource';
import { SocketModule } from 'sockets/sockets.module';
import { FriendsModule } from './friends/friends.module';
import { NotiEndUsersModule } from './noti-end-users/noti-end-users.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRoot(ChatAppDataSource.options),
    AuthModule,
    AccountsModule,
    ApprovalsModule,
    ChatRoomsModule,
    FriendRequestsModule,
    FriendsModule,
    GoogleApiModule,
    MembersModule,
    MessagesModule,
    NetworkFilesModule,
    NotificationsModule,
    NotiEndUsersModule,
    OtpsModule,
    SocketModule,
    ReactsModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 20,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
