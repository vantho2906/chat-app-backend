import { Module, forwardRef } from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { ChatRoomsController } from './chat-rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { Message } from 'messages/entities/message.entity';
import { Account } from 'accounts/entities/account.entity';
import { Member } from 'members/entities/member.entity';
import { NetworkFile } from 'network-files/entities/networkFile.entity';
import { GoogleApiModule } from 'google-api/google-api.module';
import { MessagesModule } from 'messages/messages.module';
import { Approval } from 'approvals/entities/approval.entity';
import { AccountsModule } from 'accounts/accounts.module';
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
    AccountsModule,
    MembersModule,
  ],
  controllers: [ChatRoomsController],
  providers: [ChatRoomsService],
  exports: [ChatRoomsService],
})
export class ChatRoomsModule {}
