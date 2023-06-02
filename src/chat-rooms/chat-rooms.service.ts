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
    memberIDsAdded: string[],
    type: ChatRoomTypeEnum,
  ) {
    const selfIDInList = memberIDsAdded.find((id) => id == self.id);
    if (selfIDInList) return [null, 'Can not add you yourself to room '];
    if (type == ChatRoomTypeEnum.OWN) {
      if (memberIDsAdded.length != 0) return [null, 'Own room only has you'];
      const existOwnRoom = await this.chatRoomRepository.findOne({
        where: {
          type: ChatRoomTypeEnum.OWN,
          members: { account: { id: self.id } },
        },
      });
      if (existOwnRoom) return [null, 'Already create own room'];
      const room = await this.chatRoomRepository.create({
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
    }
    if (type == ChatRoomTypeEnum.ONE_ON_ONE) {
      if (memberIDsAdded.length != 1)
        return [null, 'One on one room must has only 2 members'];
      const opponentId: string = memberIDsAdded[0];
      const opponent = await this.accountRepository.findOne({
        where: { id: opponentId, isActive: true },
      });
      if (!opponent) return [null, 'Account not found'];
      const existSelfMemberInThatRoom: Member =
        await this.memberRepository.findOne({
          where: {
            account: { id: self.id },
            room: {
              type: ChatRoomTypeEnum.ONE_ON_ONE,
              members: { account: { id: opponentId } },
            },
          },
          relations: {
            room: { members: { account: true } },
          },
        });
      if (existSelfMemberInThatRoom) return [null, 'Already create that room'];
      // const existRoom = selfMembers.find((selfMember) => {
      //   const accountRoomId: string[] = [];
      //   selfMember.room.members.map((member) => {
      //     accountRoomId.push(member.account.id);
      //   });
      //   return accountRoomId.includes(opponentId);
      // });
      // console.log(existRoom);
      // if (existRoom) return [null, 'Already create that room'];
      const room = await this.chatRoomRepository.create({
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
    }
    // case room of multiple users
    if (memberIDsAdded.length == 0 || memberIDsAdded.length >= 100)
      return [null, 'Number of members is between 2 and 100'];
    const members: Account[] = await this.accountRepository.find({
      where: { id: In(memberIDsAdded) },
      select: {
        id: true,
        fname: true,
        lname: true,
        isActive: true,
        avatarUrl: true,
      },
    });
    if (members.length < memberIDsAdded.length)
      return [null, 'Some accounts not found or inactive'];
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
    index = 0;
    while (index < 2 && index < members.length) {
      avatarUrls.push(members[index].avatarUrl || members[index].fname[0]); //if avatarUrls null then replace by first letter of fname
      index++;
    }
    const membersInRoom = [];
    members.map((member) => {
      membersInRoom.push({
        account: { id: member.id },
      });
    });
    membersInRoom.push({
      account: { id: self.id },
      role: MemberRoleEnum.ADMIN,
    });
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
        room: { members: { account: true } },
      },
      order: {
        room: { updatedAt: 'DESC' },
      },
    });
    let rooms: ChatRoom[] = selfMembers.map((selfMember) => selfMember.room);
    rooms = rooms.map((room) => {
      if (room.type == ChatRoomTypeEnum.OWN) {
        room.avatarUrls = [self.avatarUrl || self.fname[0]];
        // get room name
        if (room.members[0].nickname)
          room.name = room.members[0].nickname; //index 0 is self
        else room.name = self.lname + ' ' + self.fname;
      } else if (room.type == ChatRoomTypeEnum.ONE_ON_ONE) {
        const opponent: Member =
          room.members[0].account.id == self.id
            ? room.members[1]
            : room.members[0];
        room.avatarUrls = [
          opponent.account.avatarUrl || opponent.account.fname[0],
        ];
        if (opponent.nickname) room.name = opponent.nickname;
        else room.name = opponent.account.lname + ' ' + opponent.account.fname;
      } else {
        let index = 0;
        room.avatarUrls = [];
        while (index < 2 && index < room.members.length) {
          if (room.members[index].account.id != self.id) {
            room.avatarUrls.push(
              room.members[index].account.avatarUrl ||
                room.members[index].account.fname[0],
            );
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
      `${self.lname} ${self.fname} left room`,
      null,
    );
    return [msg, null];
  }
}
