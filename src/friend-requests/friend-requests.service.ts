import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountsService } from 'accounts/accounts.service';
import { Account } from 'accounts/entities/account.entity';
import { In, Repository } from 'typeorm';
import { FriendRequest } from './entities/friendRequest.entity';
import { FriendStatus } from 'etc/enum';
import { Friend } from 'friends/entities/friend.entity';

@Injectable()
export class FriendRequestsService {
  constructor(
    private readonly accountsService: AccountsService,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,

    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
  ) {}

  async sendFriendRequest(selfId: string, receiverId: string) {
    const receiver: Account = await this.accountRepository.findOne({
      where: { isActive: true, id: receiverId },
    });
    if (!receiver) return [null, 'User not found'];
    const existRequest: FriendRequest =
      await this.friendRequestRepository.findOne({
        relations: {
          sender: true,
          receiver: true,
        },
        where: {
          sender: { id: In([selfId, receiverId]) },
          receiver: { id: In([selfId, receiverId]) },
        },
      });
    if (existRequest) {
      if (existRequest.sender.id == selfId)
        return [null, 'Already sent friend request before'];
      if (existRequest.sender.id == receiverId)
        return [null, 'Already received friend request'];
    }
    const result = await this.friendRequestRepository.save({
      sender: { id: selfId },
      receiver: { id: receiverId },
    });
    return [result, null];
  }

  async cancelFriendRequest(selfId: string, opponentId: string) {
    const opponent: Account = await this.accountRepository.findOne({
      where: { isActive: true, id: opponentId },
    });
    if (!opponent) return [null, 'User not found'];
    const existRequest: FriendRequest =
      await this.friendRequestRepository.findOne({
        where: {
          sender: { id: In([selfId, opponentId]) },
          receiver: { id: In([selfId, opponentId]) },
        },
      });
    if (!existRequest) return [null, 'Friend request not exist'];
    await this.friendRequestRepository.delete(existRequest.id);
    return [true, null];
  }

  async getFriendStatus(selfId: string, opponentId: string) {
    const opponent: Account = await this.accountRepository.findOne({
      where: { isActive: true, id: opponentId },
    });
    if (!opponent) return [null, 'User not found'];
    const existFriend: Friend = await this.friendRepository.findOne({
      relations: {
        account1: true,
        account2: true,
      },
      where: {
        account1: { id: In([selfId, opponentId]) },
        account2: { id: In([selfId, opponentId]) },
      },
    });
    if (existFriend) return [FriendStatus.FRIEND, null];
    const existFriendRequest: FriendRequest =
      await this.friendRequestRepository.findOne({
        relations: {
          sender: true,
          receiver: true,
        },
        where: {
          sender: { id: In([selfId, opponentId]) },
          receiver: { id: In([selfId, opponentId]) },
        },
      });
    if (!existFriendRequest) return [FriendStatus.NOT_FRIEND, null];
    if (existFriendRequest.sender.id == selfId)
      return [FriendStatus.SENT_FRIENT_REQUEST, null];
    return [FriendStatus.RECEIVED_FRIEND_REQUEST, null];
  }

  async acceptFriend(self: Account, opponentId: string) {
    const opponent: Account = await this.accountRepository.findOne({
      where: { isActive: true, id: opponentId },
    });
    if (!opponent) return [null, 'User not found'];
    const existFriend: Friend = await this.friendRepository.findOne({
      relations: {
        account1: true,
        account2: true,
      },
      where: {
        account1: { id: In([self.id, opponentId]) },
        account2: { id: In([self.id, opponentId]) },
      },
    });
    if (existFriend) return [null, 'Already be friend'];
    const existFriendRequest: FriendRequest =
      await this.friendRequestRepository.findOne({
        relations: {
          sender: true,
          receiver: true,
        },
        where: {
          sender: { id: In([self.id, opponentId]) },
          receiver: { id: In([self.id, opponentId]) },
        },
      });
    if (!existFriendRequest) return [null, 'Request not exist'];
    if (existFriendRequest.sender.id == self.id)
      return [null, 'You sent request, not received'];
    await this.friendRequestRepository.delete(existFriendRequest.id);
    await this.friendRepository.save({
      account1: { id: self.id },
      account2: { id: self.id },
    });
    return [true, null];
  }

  async cancelFriend(selfId: string, opponentId: string) {
    const opponent: Account = await this.accountRepository.findOne({
      where: { id: opponentId },
    });
    if (!opponent) return [null, 'User not found'];
    const existFriend: Friend = await this.friendRepository.findOne({
      relations: {
        account1: true,
        account2: true,
      },
      where: {
        account1: { id: In([selfId, opponentId]) },
        account2: { id: In([selfId, opponentId]) },
      },
    });
    if (!existFriend) return [null, 'Not friend yet'];
    await this.friendRepository.delete(existFriend.id);
    return [true, null];
  }
}
