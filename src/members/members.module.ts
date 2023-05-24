import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'accounts/entities/account.entity';
import { ChatRoom } from 'chat-rooms/entities/chat-room.entity';
import { Message } from 'messages/entities/message.entity';
import { Member } from './entities/member.entity';
import { NetworkFile } from 'network-files/entities/networkFile.entity';
import { MessagesModule } from 'messages/messages.module';
import { Approval } from 'approvals/entities/approval.entity';
import { Notification } from 'notifications/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      ChatRoom,
      Message,
      Member,
      NetworkFile,
      Approval,
      Notification,
    ]),
    MessagesModule,
  ],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
