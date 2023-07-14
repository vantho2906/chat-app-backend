import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { In, Not, Repository } from 'typeorm';
import { Message } from 'messages/entities/message.entity';
import {
  ChatRoomTypeEnum,
  FileCategoryEnum,
  FileTypeMediaEnum,
  FileTypeOtherEnum,
  MemberRoleEnum,
  MessageTypeEnum,
} from 'etc/enums';
import { Account } from 'accounts/entities/account.entity';
import { Member } from 'members/entities/member.entity';
import { NetworkFile } from 'network-files/entities/networkFile.entity';
import { GoogleApiService } from 'google-api/google-api.service';
import { MessagesService } from 'messages/messages.service';
import { Approval } from 'approvals/entities/approval.entity';
import { AccountsService } from 'accounts/accounts.service';
import { MembersService } from 'members/members.service';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,

    @InjectRepository(NetworkFile)
    private readonly networkFileRepository: Repository<NetworkFile>,

    private readonly googleApiService: GoogleApiService,

    private readonly messagesService: MessagesService,

    private readonly accountService: AccountsService,

    private readonly memberService: MembersService,
  ) {}

  async isExistOneOnOneRoom(selfId: string, opponentId: string) {
    return !!(await this.memberRepository.findOne({
      where: {
        account: { id: selfId },
        room: {
          type: ChatRoomTypeEnum.ONE_ON_ONE,
          members: { account: { id: opponentId } },
        },
      },
      relations: {
        room: { members: { account: true } },
      },
    }));
  }

  async isExistOwnRoom(userId: string) {
    await this.chatRoomRepository.findOne({
      where: {
        type: ChatRoomTypeEnum.OWN,
        members: { account: { id: userId } },
      },
    });
  }

  async createRoom(
    self: Account,
    memberIDsAdded: string[],
    type: ChatRoomTypeEnum,
  ) {
    let room: ChatRoom;
    memberIDsAdded = memberIDsAdded.filter((id) => id !== self.id);
    switch (type) {
      case ChatRoomTypeEnum.OWN:
        if (memberIDsAdded.length > 0)
          return [null, 'Own room must has only room creator'];
        const isExistOwnRoom = this.isExistOwnRoom(self.id);
        if (isExistOwnRoom) return [null, 'Already create own room'];
        room = await this.chatRoomRepository.create({
          type,
          members: [
            {
              role: MemberRoleEnum.ADMIN,
              account: { id: self.id },
            },
          ],
          avatarUrls: [self.avatarUrl],
        });
        return [room, null];
        break;
      case ChatRoomTypeEnum.ONE_ON_ONE:
        if (memberIDsAdded.length != 1)
          return [null, 'One on one room must has 2 members'];
        const opponentId: string = memberIDsAdded[0];
        const opponent = await this.accountService.getById(opponentId);
        if (!opponent) return [null, 'Account not found'];
        if (this.isExistOneOnOneRoom(self.id, opponentId))
          return [null, 'Already create that room'];
        room = await this.chatRoomRepository.create({
          type,
          members: [
            {
              account: { id: self.id },
            },
            {
              account: { id: opponent.id },
            },
          ],
          avatarUrls: [opponent.avatarUrl || opponent.fname[0]],
        });
        await this.chatRoomRepository.save(room);
        return [room, null];
        break;
      case ChatRoomTypeEnum.MULTIPLE_USERS:
        if (memberIDsAdded.length == 0 || memberIDsAdded.length >= 50)
          return [null, 'Number of members is between 2 and 50'];
        const activeMembers: Account[] =
          await this.accountService.getListOfAccounts(memberIDsAdded);
        if (activeMembers.length < memberIDsAdded.length)
          return [null, 'Some accounts not found or inactive'];
        const avatarUrls: string[] = [];
        const defaultNumberNamesOfRoom = 6;
        let name = '';
        let index = 0;
        while (
          index < defaultNumberNamesOfRoom &&
          index < activeMembers.length
        ) {
          name += activeMembers[index].fname + ', ';
          index++;
        }
        name = name.slice(0, name.length - 2);
        let index2 = 0;
        const defaultNumberOfAvatarsOfRoom = 2;
        while (
          index2 < defaultNumberOfAvatarsOfRoom &&
          index2 < activeMembers.length
        ) {
          avatarUrls.push(
            activeMembers[index2].avatarUrl || activeMembers[index2].fname[0],
          ); //if avatarUrls null then replace by first letter of fname
          index2++;
        }
        const membersInRoom = [];
        activeMembers.map((member) => {
          membersInRoom.push({
            account: { id: member.id },
          });
        });
        membersInRoom.push({
          account: { id: self.id },
          role: MemberRoleEnum.ADMIN,
        });
        room = await this.chatRoomRepository.create({
          type,
          name,
          members: membersInRoom,
        });
        room.avatarUrls = avatarUrls;
        await this.chatRoomRepository.save(room);
        return [room, null];
      default:
        break;
    }
  }

  async getAllRoomsThatUserIn(selfId: string) {
    const selfMembers: Member[] = await this.memberRepository.find({
      where: {
        account: { id: selfId },
        isRoomLimited: false,
      },
      relations: {
        room: { members: { account: true } },
      },
      order: {
        room: { updatedAt: 'DESC' },
      },
    });
    const rooms: ChatRoom[] = selfMembers.map((selfMember) => selfMember.room);
    return rooms;
  }

  async getAllRooms(self: Account) {
    let rooms: ChatRoom[] = await this.getAllRoomsThatUserIn(self.id);
    rooms = rooms.map((room) => {
      switch (room.type) {
        case ChatRoomTypeEnum.OWN:
          room.avatarUrls = [self.avatarUrl || self.fname[0]];
          if (room.members[0].nickname) room.name = room.members[0].nickname;
          else room.name = self.lname + ' ' + self.fname;
          break;
        case ChatRoomTypeEnum.ONE_ON_ONE:
          const opponent: Member =
            self.id != room.members[0].account.id
              ? room.members[0]
              : room.members[1];
          room.avatarUrls = [
            opponent.account.avatarUrl || opponent.account.fname[0],
          ];
          if (opponent.nickname) room.name = opponent.nickname;
          else
            room.name = opponent.account.lname + ' ' + opponent.account.fname;
          break;
        case ChatRoomTypeEnum.MULTIPLE_USERS:
          let index = 0;
          room.avatarUrls = [];
          while (index < 2 && index < room.members.length) {
            room.avatarUrls.push(
              room.members[index].account.avatarUrl ||
                room.members[index].account.fname[0],
            );
            index++;
          }
          break;
        default:
          break;
      }
      delete room.members;
      return room;
    });
    return [rooms, null];
  }

  async getRoomThatUserIn(userId: string, roomId: number) {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId, members: { account: { id: userId } } },
    });
    return room;
  }

  async getRoomWithMessageThatUserIn(userId: string, roomId: number) {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId, members: { account: { id: userId } } },
      relations: {
        messages: { files: true },
        members: true,
      },
    });
    return room;
  }

  async getAllRoomFiles(
    self: Account,
    roomId: number,
    fileCategory: FileCategoryEnum,
  ) {
    const room = await this.getRoomThatUserIn(self.id, roomId);
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
    const room = await this.getRoomThatUserIn(self.id, roomId);
    if (!room) return [null, 'Room not found'];
    if (room.type != ChatRoomTypeEnum.MULTIPLE_USERS)
      return [null, 'Can only change name of group'];
    if (name.trim().length == 0) return [null, 'Name must not be empty'];
    room.name = name;
    await this.chatRoomRepository.save(room);
    return [room, null];
  }

  async getAllMembersInRoom(self: Account, roomId: number) {
    const room = await this.getRoomThatUserIn(self.id, roomId);
    if (!room) return [null, 'Room not found'];
    if (room.type != ChatRoomTypeEnum.MULTIPLE_USERS)
      return [null, 'Room must be kind of multiple users'];
    const members = await this.memberRepository.find({
      where: {
        room: { id: roomId },
      },
    });
    return [members, null];
  }

  async deleteRoom(self: Account, roomId: number) {
    const room = await this.getRoomWithMessageThatUserIn(self.id, roomId);
    if (!room) return [null, 'Room not found'];
    if (room.type != ChatRoomTypeEnum.MULTIPLE_USERS)
      return [null, 'Room must be kind of multiple users'];
    if (room.members[0].role != MemberRoleEnum.ADMIN)
      return [null, 'You are not admin'];
    //delete all msgs in room
    const allMsgsOfRoom = room.messages;
    // const fileIds = [];
    if (allMsgsOfRoom.length > 0) {
      const fileIdsOnDrive = [];
      for (const msg of allMsgsOfRoom) {
        for (const file of msg.files) {
          fileIdsOnDrive.push(file.fileIdOnDrive);
          // fileIds.push(file.id);
        }
      }
      await this.googleApiService.deleteMultipleFiles(fileIdsOnDrive);
    }
    await this.chatRoomRepository.delete(room.id);
    return [true, null];
  }

  async toggleApprovalFeature(self: Account, roomId: number) {
    const selfMember = await this.memberService.getMemberWithRoomRelation(
      self.id,
      roomId,
    );
    if (!selfMember) return [null, 'Room not found'];
    const room = selfMember.room;
    if (room.type != ChatRoomTypeEnum.MULTIPLE_USERS)
      return [null, 'Room type must be kind of multiple users'];
    if (selfMember.role == MemberRoleEnum.USER)
      return [null, 'You dont have permission'];
    let msgNotiText;
    if (room.isApprovalEnable) {
      room.isApprovalEnable = false;
      msgNotiText = `${self.lname} ${self.fname} turn off approval feature`;
    } else {
      room.isApprovalEnable = true;
      msgNotiText = `${self.lname} ${self.fname} turn on approval feature`;
    }
    await this.chatRoomRepository.save(room);
    const msgs: Message[] = [];
    const [msg, err] = await this.messagesService.addMsg(
      MessageTypeEnum.NOTIFICATION,
      null,
      roomId,
      msgNotiText,
      null,
    );
    const msgConvert = msg as Message;
    msgs.push(msgConvert);
    if (!room.isApprovalEnable) {
      const approvals = await this.approvalRepository.find({
        where: { room: { id: roomId } },
        relations: {
          account: true,
        },
      });
      const newMembers: Member[] = [];
      if (approvals.length > 0) {
        const approvalIds: number[] = [];
        let approveMsgText = '';
        for (const approval of approvals) {
          const member = new Member();
          member.account = approval.account;
          member.room = room;
          newMembers.push(member);
          approvalIds.push(approval.id);
          approveMsgText +=
            approval.account.lname + ' ' + approval.account.fname + ', ';
        }
        // delete approvals
        await this.approvalRepository.delete(approvalIds);
        // add members
        await this.memberRepository.save(newMembers);
        // delete , at the end of text message
        approveMsgText = approveMsgText.slice(0, approveMsgText.length - 2);
        approveMsgText += 'entered room';
        const [msg, err] = await this.messagesService.addMsg(
          MessageTypeEnum.NOTIFICATION,
          null,
          roomId,
          approveMsgText,
          null,
        );
        const msgConvert = msg as Message;
        msgs.push(msgConvert);
      }
    }
    return [msgs, null];
  }

  async leaveRoom(self: Account, roomId: number) {
    const selfMember = await this.memberService.getMemberWithRoomRelation(
      self.id,
      roomId,
    );
    if (!selfMember) return [null, 'Room not found'];
    if (selfMember.room.type != ChatRoomTypeEnum.MULTIPLE_USERS)
      return [null, 'Room type must be kind of multiple users'];
    if (selfMember.room.members.length == 1) {
      await this.deleteRoom(self, roomId);
      return [true, null];
    }
    if (selfMember.role == MemberRoleEnum.ADMIN) {
      const members = await this.memberRepository.find({
        where: { account: { id: Not(self.id) }, room: { id: roomId } },
        order: {
          //put role vice in front
          role: 'DESC',
        },
      });
      members[0].role = MemberRoleEnum.ADMIN;
      await this.memberRepository.save([members[0]]);
    }
    await this.memberRepository.delete(selfMember.id);
    //create message
    const [msg, err] = await this.messagesService.addMsg(
      MessageTypeEnum.NOTIFICATION,
      null,
      roomId,
      `${self.lname} ${self.fname} left room`,
      null,
    );
    return [msg, null];
  }
}
