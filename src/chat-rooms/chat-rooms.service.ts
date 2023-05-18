import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { In, Repository } from 'typeorm';
import { Message } from 'messages/entities/message.entity';
import {
  ChatRoomTypeEnum,
  FileCategoryEnum,
  FileTypeMediaEnum,
  FileTypeOtherEnum,
  MemberRoleEnum,
} from 'etc/enum';
import { Account } from 'accounts/entities/account.entity';
import { Member } from 'members/entities/member.entity';
import { NetworkFile } from 'network-files/entities/networkFile.entity';

@Injectable()
export class ChatRoomsService {
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

  async createRoom(
    self: Account,
    memberIdList: string[],
    type: ChatRoomTypeEnum,
  ) {
    if (!memberIdList.includes(self.id))
      return [null, 'List of members does not contain you'];
    if (type == ChatRoomTypeEnum.OWN) {
      if (memberIdList.length != 1) return [null, 'Own room only has you'];
      const existOwnRoom = await this.chatRoomRepository.findOne({
        where: {
          type: ChatRoomTypeEnum.OWN,
          members: { account: { id: self.id } },
        },
      });
      if (existOwnRoom) return [null, 'Already create own room'];
      const room = await this.chatRoomRepository.create({
        type,
        name: self.fname,
        members: [
          {
            role: MemberRoleEnum.ADMIN,
            nickname: self.lname + ' ' + self.fname,
            account: { id: self.id },
          },
        ],
        avatarUrls: [self.avatar.url],
      });
      return [room, null];
    }
    if (memberIdList.length < 2) return [null, 'Number of members must be > 1'];
    if (type == ChatRoomTypeEnum.ONE_ON_ONE) {
      if (memberIdList.length != 2)
        return [null, 'One on one room must has only 2 members'];
      const opponentId: string =
        memberIdList[0] == self.id ? memberIdList[1] : memberIdList[0];
      const selfMembers: Member[] = await this.memberRepository.find({
        where: {
          account: { id: self.id },
          room: { type: ChatRoomTypeEnum.ONE_ON_ONE },
        },
        relations: {
          room: { members: { account: true } },
        },
      });
      const existRoom = selfMembers.find((selfMember) => {
        const accountRoomId: string[] = [];
        selfMember.room.members.map((member) => {
          accountRoomId.push(member.account.id);
        });
        return accountRoomId.includes(opponentId);
      });
      console.log(existRoom);
      if (existRoom) return [null, 'Already create that room'];
      const opponent = await this.accountRepository.findOne({
        where: { id: opponentId, isActive: true },
        relations: { avatar: true },
      });
      if (!opponent) return [null, 'Account not found'];
      const room = await this.chatRoomRepository.create({
        type,
        members: [
          {
            nickname: self.lname + ' ' + self.fname,
            account: { id: self.id },
          },
          {
            nickname: opponent.lname + ' ' + opponent.fname,
            account: { id: opponent.id },
          },
        ],
        avatarUrls: [opponent.avatar.url],
      });
      await this.chatRoomRepository.save(room);
      return [room, null];
    }
    if (memberIdList.length > 100)
      return [null, 'Maximum number of members is 100'];
    const members = await this.accountRepository.find({
      where: { id: In(memberIdList) },
      relations: {
        avatar: true,
      },
      select: {
        fname: true,
        lname: true,
        isActive: true,
      },
    });
    if (members.length < memberIdList.length)
      return [null, 'Some accounts not found'];
    const inActiveAccounts: Account[] = [];
    const avatarUrls: string[] = [];
    let name: string = null;
    let index = 0;
    while (index < 6 && index < members.length) {
      if (members[index].id != self.id) {
        index++;
        name += members[index].fname + ' ';
      }
    }
    index = 0;
    while (index < 2 && index < members.length) {
      if (members[index].id != self.id) {
        index++;
        avatarUrls.push(members[index].avatar.url);
      }
    }
    const membersInRoom = [];
    members.map((member) => {
      if (!member.isActive) inActiveAccounts.push(member);
      membersInRoom.push({
        nickname: member.lname + ' ' + member.fname,
        account: { id: member.id },
      });
    });
    if (inActiveAccounts.length > 0)
      return [inActiveAccounts, 'The following accounts are not active'];
    const room = await this.chatRoomRepository.create({
      type,
      name,
      avatarUrls,
      members: membersInRoom,
    });
    await this.chatRoomRepository.save(room);
    return [room, null];
  }

  async getAllRooms(self: Account) {
    const selfMembers: Member[] = await this.memberRepository.find({
      where: {
        account: { id: self.id },
        room: { isLimited: false },
      },
      relations: {
        room: { members: { account: { avatar: true } } },
      },
      order: {
        room: { updatedAt: 'DESC' },
      },
    });
    let rooms: ChatRoom[] = selfMembers.map((selfMember) => selfMember.room);
    rooms = rooms.map((room) => {
      if (room.type == ChatRoomTypeEnum.OWN) {
        room.avatarUrls = [self.avatar.url];
      } else if (room.type == ChatRoomTypeEnum.ONE_ON_ONE) {
        const opponent: Account =
          room.members[0].account.id == self.id
            ? room.members[1].account
            : room.members[0].account;
        room.avatarUrls = [opponent.avatar.url];
        room.name = opponent.lname + ' ' + opponent.fname;
      } else {
        let index = 0;
        while (index < 2 && index < room.members.length) {
          if (room.members[index].account.id != self.id) {
            index++;
            room.avatarUrls.push(room.members[index].account.avatar.url);
          }
        }
      }
      room.members = null;
      return room;
    });
    return [rooms, null];
  }

  async getAllRoomFiles(
    self: Account,
    roomId: number,
    fileCategory: FileCategoryEnum,
  ) {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId, members: { account: { id: self.id } } },
    });
    if (!room) return [null, 'Room not found'];
    const whereCondition = {
      mimeType: In(Object.values(FileTypeMediaEnum)),
      message: { room: { id: roomId } },
    };
    if (fileCategory == FileCategoryEnum.OTHER) {
      whereCondition.mimeType = In(Object.values(FileTypeOtherEnum));
    }
    const files = await this.networkFileRepository.find({
      where: whereCondition,
      order: {
        createdAt: 'DESC',
      },
    });
    return [files, null];
  }

  async updateRoomName(self: Account, roomId: number, name: string) {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId, members: { account: { id: self.id } } },
    });
    if (!room) return [null, 'Room not found'];
    if (room.type != ChatRoomTypeEnum.MULTIPLE_USERS)
      return [null, 'Can only change name of group'];
    if (name.trim().length == 0) return [null, 'Name must not be empty'];
    room.name = name;
    await this.chatRoomRepository.save(room);
    return [room, null];
  }

  async getAllRoomMembers(self: Account, roomId: number) {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId, members: { account: { id: self.id } } },
    });
    if (!room) return [null, 'Room not found'];
    if (room.type != ChatRoomTypeEnum.MULTIPLE_USERS)
      return [null, 'Room must be kind of multiple users'];
    const members = await this.memberRepository.find({
      where: {
        room: { id: roomId },
      },
      relations: {
        account: { avatar: true },
      },
      select: {
        account: { password: false },
      },
    });
    return [members, null];
  }
}
