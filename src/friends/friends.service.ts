import { Injectable } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend } from './entities/friend.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
  ) {}
  async getFriendList(selfId: string) {
    const friendListContainsSelf = await this.friendRepository.find({
      where: [{ account1: { id: selfId } }, { account2: { id: selfId } }],
      relations: {
        account1: true,
        account2: true,
      },
    });
    const friendList = friendListContainsSelf.map((friend) => {
      if (friend.account1.id != selfId) return friend.account1;
      return friend.account2;
    });
    return [friendList, null];
  }

  create(createFriendDto: CreateFriendDto) {
    return 'This action adds a new friend';
  }

  findAll() {
    return `This action returns all friends`;
  }

  findOne(id: number) {
    return `This action returns a #${id} friend`;
  }

  update(id: number, updateFriendDto: UpdateFriendDto) {
    return `This action updates a #${id} friend`;
  }

  remove(id: number) {
    return `This action removes a #${id} friend`;
  }
}
