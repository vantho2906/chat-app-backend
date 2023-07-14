import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Account } from 'accounts/entities/account.entity';
import { ChatRoom } from 'chat-rooms/entities/chat-room.entity';
import { GoogleApiModule } from 'google-api/google-api.module';
import { NetworkFile } from 'network-files/entities/networkFile.entity';
import { Member } from 'members/entities/member.entity';
import { MembersModule } from 'members/members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Account, Member, ChatRoom, NetworkFile]),
    GoogleApiModule,
    forwardRef(() => MembersModule),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
