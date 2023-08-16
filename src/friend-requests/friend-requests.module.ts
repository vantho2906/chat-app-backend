import { Module, forwardRef } from '@nestjs/common';
import { FriendRequestsService } from './friend-requests.service';
import { FriendRequestsController } from './friend-requests.controller';
import { AccountsModule } from 'accounts/accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'accounts/entities/account.entity';
import { FriendRequest } from './entities/friendRequest.entity';
import { FriendsModule } from 'friends/friends.module';
import { Friend } from 'friends/entities/friend.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, FriendRequest, Friend]),
    FriendsModule,
    forwardRef(() => AccountsModule),
  ],
  controllers: [FriendRequestsController],
  providers: [FriendRequestsService],
  exports: [FriendRequestsService],
})
export class FriendRequestsModule {}
