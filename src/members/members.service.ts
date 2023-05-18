import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'accounts/entities/account.entity';
import { ChatRoom } from 'chat-rooms/entities/chat-room.entity';
import { Message } from 'messages/entities/message.entity';
import { And, Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { NetworkFile } from 'network-files/entities/networkFile.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(NetworkFile)
    private readonly networkFileRepository: Repository<NetworkFile>,
  ) {}

  async updateNickName(
    self: Account,
    roomId: number,
    targetId: string,
    nickname: string,
  ) {
    if (nickname.trim().length == 0)
      return [null, 'Nickname must be not empty'];
    const selfMember = await this.memberRepository.findOne({
      where: {
        account: { id: self.id },
        room: { id: roomId, members: { account: { id: targetId } } },
      },
    });
    if (!selfMember) return [null, 'Room not found'];
    const memberToUpdateNickname = await this.memberRepository.findOne({
      where: {
        room: { id: roomId },
        account: { id: targetId },
      },
    });
    memberToUpdateNickname.nickname = nickname;
    await this.memberRepository.save(memberToUpdateNickname);
    return [memberToUpdateNickname, null];
  }
}
