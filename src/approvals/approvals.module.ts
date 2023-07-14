import { Module } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from 'chat-rooms/entities/chat-room.entity';
import { Message } from 'messages/entities/message.entity';
import { Member } from 'members/entities/member.entity';
import { NetworkFile } from 'network-files/entities/networkFile.entity';
import { Approval } from './entities/approval.entity';
import { GoogleApiModule } from 'google-api/google-api.module';
import { MessagesModule } from 'messages/messages.module';
import { Account } from 'accounts/entities/account.entity';
import { ChatRoomsModule } from 'chat-rooms/chat-rooms.module';
import { MembersModule } from 'members/members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      ChatRoom,
      Message,
      Member,
      NetworkFile,
      Approval,
    ]),
    GoogleApiModule,
    MessagesModule,
    ChatRoomsModule,
    MembersModule,
  ],
  controllers: [ApprovalsController],
  providers: [ApprovalsService],
})
export class ApprovalsModule {}
