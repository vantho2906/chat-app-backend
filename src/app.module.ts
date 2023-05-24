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
import TestNestjsDataSource from './database/datasource';
import { GatewayModule } from 'gateway/gateway.module';
import { FriendsModule } from './friends/friends.module';
import { NotiEndUsersModule } from './noti-end-users/noti-end-users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(TestNestjsDataSource.options),
    AccountsModule,
    NetworkFilesModule,
    ChatRoomsModule,
    MembersModule,
    ApprovalsModule,
    FriendRequestsModule,
    ReactsModule,
    MessagesModule,
    NotificationsModule,
    AuthModule,
    OtpsModule,
    GoogleApiModule,
    GatewayModule,
    FriendsModule,
    NotiEndUsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
