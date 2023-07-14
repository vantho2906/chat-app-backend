import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountsService } from 'accounts/accounts.service';
import { Account } from 'accounts/entities/account.entity';
import { In, Repository } from 'typeorm';
import { FriendRequest } from './entities/friendRequest.entity';
import { FriendStatus } from 'etc/enums';
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

  async getRequest(selfId: string, receiverId: string) {
    const request: FriendRequest = await this.friendRequestRepository.findOne({
      where: {
        sender: { id: In([selfId, receiverId]) },
        receiver: { id: In([selfId, receiverId]) },
      },
    });
    return request;
  }

  async getRequestWithRelations(selfId: string, receiverId: string) {
    const request: FriendRequest = await this.friendRequestRepository.findOne({
      relations: {
        sender: true,
        receiver: true,
      },
      where: {
        sender: { id: In([selfId, receiverId]) },
        receiver: { id: In([selfId, receiverId]) },
      },
    });
    return request;
  }

  async sendFriendRequest(selfId: string, receiverId: string) {
    const receiver: Account = await this.accountsService.getById(receiverId);
    if (!receiver) return [null, 'User not found'];
    const request: FriendRequest = await this.getRequestWithRelations(
      selfId,
      receiverId,
    );
    if (request) {
      if (request.sender.id == selfId)
        return [null, 'Already sent friend request before'];
      if (request.sender.id == receiverId)
        return [null, 'Already received friend request'];
    }
    const result = await this.friendRequestRepository.save({
      sender: { id: selfId },
      receiver: { id: receiverId },
    });
    return [result, null];
  }

  async cancelFriendRequest(selfId: string, opponentId: string) {
    const opponent: Account = await this.accountsService.getById(opponentId);
    if (!opponent) return [null, 'User not found'];
    const request: FriendRequest = await this.getRequest(selfId, opponentId);
    if (!request) return [null, 'Friend request not exist'];
    await this.friendRequestRepository.delete(request.id);
    return [true, null];
  }

  async isFriend(selfId: string, opponentId: string) {
    const isFriend = !!(await this.friendRepository.findOne({
      relations: {
        account1: true,
        account2: true,
      },
      where: {
        account1: { id: In([selfId, opponentId]) },
        account2: { id: In([selfId, opponentId]) },
      },
    }));
    return isFriend;
  }

  async getFriendRelation(selfId: string, opponentId: string) {
    const friendRelation: Friend = await this.friendRepository.findOne({
      relations: {
        account1: true,
        account2: true,
      },
      where: {
        account1: { id: In([selfId, opponentId]) },
        account2: { id: In([selfId, opponentId]) },
      },
    });
    return friendRelation;
  }

  async getFriendStatus(selfId: string, opponentId: string) {
    const opponent: Account = await this.accountsService.getById(opponentId);
    if (!opponent) return [null, 'User not found'];
    const isFriend = await this.isFriend(selfId, opponentId);
    if (isFriend) return [FriendStatus.FRIEND, null];
    const request: FriendRequest = await this.getRequestWithRelations(
      selfId,
      opponentId,
    );
    if (!request) return [FriendStatus.NOT_FRIEND, null];
    if (request.sender.id == selfId)
      return [FriendStatus.SENT_FRIENT_REQUEST, null];
    return [FriendStatus.RECEIVED_FRIEND_REQUEST, null];
  }

  async acceptFriend(self: Account, opponentId: string) {
    const opponent: Account = await this.accountsService.getById(opponentId);
    if (!opponent) return [null, 'User not found'];
    const isFriend = await this.isFriend(self.id, opponentId);
    if (isFriend) return [null, 'Already be friend'];
    const request: FriendRequest = await this.getRequestWithRelations(
      self.id,
      opponentId,
    );
    if (!request) return [null, 'Request not exist'];
    if (request.sender.id == self.id)
      return [null, 'You sent request, not received'];
    await this.friendRequestRepository.delete(request.id);
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
    const friendRelation: Friend = await this.getFriendRelation(
      selfId,
      opponentId,
    );
    if (!friendRelation) return [null, 'Not friend yet'];
    await this.friendRepository.delete(friendRelation.id);
    return [true, null];
  }
}
