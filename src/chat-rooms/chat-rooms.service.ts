import { Injectable } from '@nestjs/common';
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
import { convertMemberRoomRole } from 'etc/convert-member-room-role';
import { MessagesService } from 'messages/messages.service';
import { Approval } from 'approvals/entities/approval.entity';

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

    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,

    @InjectRepository(NetworkFile)
    private readonly networkFileRepository: Repository<NetworkFile>,

    private readonly googleApiService: GoogleApiService,

    private readonly messagesService: MessagesService,
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
        id: true,
        fname: true,
        lname: true,
        isActive: true,
      },
    });
    if (members.length < memberIdList.length)
      return [null, 'Some accounts not found'];
    const inActiveAccounts: Account[] = [];
    const avatarUrls: string[] = [];
    let name = '';
    let index = 0;
    console.log(members);
    while (index < 6 && index < members.length) {
      if (members[index].id != self.id) {
        name += members[index].fname + ', ';
      }
      index++;
    }
    name = name.slice(0, name.length - 2);
    console.log(name);
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
      if (member.id == self.id) {
        membersInRoom.push({
          nickname: member.lname + ' ' + member.fname,
          account: { id: member.id },
          role: MemberRoleEnum.ADMIN,
        });
      } else {
        membersInRoom.push({
          nickname: member.lname + ' ' + member.fname,
          account: { id: member.id },
        });
      }
    });
    if (inActiveAccounts.length > 0)
      return [inActiveAccounts, 'The following accounts are not active'];
    const room = await this.chatRoomRepository.create({
      type,
      name,
      members: membersInRoom,
    });
    room.avatarUrls = avatarUrls;
    await this.chatRoomRepository.save(room);
    return [room, null];
  }

  async getAllRooms(self: Account) {
    const selfMembers: Member[] = await this.memberRepository.find({
      where: {
        account: { id: self.id },
        isRoomLimited: false,
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
        room.avatarUrls = [];
        while (index < 2 && index < room.members.length) {
          if (room.members[index].account.id != self.id) {
            room.avatarUrls.push(room.members[index].account.avatar.url);
          }
          index++;
        }
      }
      delete room.members;
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
    });
    return [members, null];
  }

  async deleteRoom(self: Account, roomId: number) {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId, members: { account: { id: self.id } } },
      relations: {
        messages: { files: true },
        members: true,
      },
    });
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
    const selfMember = await this.memberRepository.findOne({
      where: { account: { id: self.id }, room: { id: roomId } },
      relations: {
        room: true,
      },
    });
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
    const msgs = [];
    const [msg, err] = await this.messagesService.addMsg(
      MessageTypeEnum.NOTIFICATION,
      null,
      roomId,
      msgNotiText,
      null,
    );
    msgs.push(msg);
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
          member.nickname =
            approval.account.lname + ' ' + approval.account.fname;
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
        msgs.push(msg);
      }
    }
    return [msgs, null];
  }

  async leaveRoom(self: Account, roomId: number) {
    const selfMember = await this.memberRepository.findOne({
      where: { account: { id: self.id }, room: { id: roomId } },
      relations: {
        room: { members: true },
      },
    });
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
      `${self.fname} ${self.lname} left room`,
      null,
    );
    return [msg, null];
  }
}
