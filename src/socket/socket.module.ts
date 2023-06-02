import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { ChatRoomsModule } from 'chat-rooms/chat-rooms.module';
import { AccountsModule } from 'accounts/accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'accounts/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    ChatRoomsModule,
    AccountsModule,
  ],
  providers: [MyGateway, Map],
})
export class SocketModule {}
