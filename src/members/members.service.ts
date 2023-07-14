import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'accounts/entities/account.entity';
import { ChatRoom } from 'chat-rooms/entities/chat-room.entity';
import { Message } from 'messages/entities/message.entity';
import { In, Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { NetworkFile } from 'network-files/entities/networkFile.entity';
import {
  ChatRoomTypeEnum,
  MemberRoleEnum,
  MessageTypeEnum,
  NotificationTypeEnum,
} from 'etc/enums';
import { MessagesService } from 'messages/messages.service';
import { Approval } from 'approvals/entities/approval.entity';
import { convertMemberRoomRole } from 'etc/convert-member-room-role';
import { Notification } from 'notifications/entities/notification.entity';
import { NotiEndUser } from 'noti-end-users/entities/noti-end-user.entity';
import { ChatRoomsService } from 'chat-rooms/chat-rooms.service';
import { AccountsService } from 'accounts/accounts.service';

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

    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,

    @InjectRepository(NetworkFile)
    private readonly networkFileRepository: Repository<NetworkFile>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,

    private readonly accountService: AccountsService,
  ) {}

  async areBothUsersInRoom(yourId: string, roomId: number, targetId: string) {
    const selfMember = !!(await this.memberRepository.findOne({
      where: {
        account: { id: yourId },
        room: { id: roomId, members: { account: { id: targetId } } },
      },
    }));
    return selfMember;
  }

  async getMember(userId: string, roomId: number) {
    const member = await this.memberRepository.findOne({
      where: {
        room: { id: roomId },
        account: { id: userId },
      },
    });
    return member;
  }

  async getMemberWithRoomRelation(userId: string, roomId: number) {
    const member = await this.memberRepository.findOne({
      where: { account: { id: userId }, room: { id: roomId } },
      relations: {
        room: true,
      },
    });
    return member;
  }

  async getMemberWithMsg(userId: string, msgId: number) {
    const member = await this.memberRepository.findOne({
      where: { account: { id: userId }, room: { messages: { id: msgId } } },
      relations: {
        room: { messages: true },
      },
    });
    return member;
  }

  async getAdminAndVices(roomId: number) {
    const adminAndVices = await this.memberRepository.find({
      where: {
        room: { id: roomId },
        role: In([MemberRoleEnum.ADMIN, MemberRoleEnum.VICE]),
      },
      relations: {
        account: true,
      },
    });
    return adminAndVices;
  }

  async updateNickName(
    self: Account,
    roomId: number,
    targetId: string,
    nickname: string,
  ) {
    if (nickname.trim().length == 0)
      return [null, 'Nickname must be not empty'];
    const isBothUsersInRoom = await this.areBothUsersInRoom(
      self.id,
      roomId,
      targetId,
    );
    if (!isBothUsersInRoom) return [null, 'Member not found'];
    const memberToUpdateNickname = await this.getMember(self.id, roomId);
    memberToUpdateNickname.nickname = nickname;
    await this.memberRepository.save(memberToUpdateNickname);
    return [memberToUpdateNickname, null];
  }

  async toggleLimitRoom(self: Account, roomId: number) {
    const selfMember = await this.getMember(self.id, roomId);
    if (!selfMember) return [null, 'Room not found'];
    selfMember.isRoomLimited = selfMember.isRoomLimited ? false : true;
    await this.memberRepository.save(selfMember);
    return [selfMember, null];
  }

  async addMember(self: Account, roomId: number, targetAccountId: string) {
    const selfMember = await this.getMemberWithRoomRelation(self.id, roomId);
    if (!selfMember) return [null, 'Room not found'];
    if (selfMember.room.type != ChatRoomTypeEnum.MULTIPLE_USERS)
      return [null, 'Room type must be multiple users'];
    const target = await this.accountService.getById(targetAccountId);
    if (!target) return [null, 'User not found'];
    const targetMember = await this.getMember(targetAccountId, roomId);
    if (targetMember) return [null, 'User already in room'];
    const existApproval = await this.approvalRepository.findOne({
      where: { account: { id: targetAccountId } },
    });
    if (
      selfMember.role == MemberRoleEnum.ADMIN ||
      selfMember.role == MemberRoleEnum.VICE ||
      !selfMember.room.isApprovalEnable
    ) {
      const newMember = new Member();
      newMember
        .setAccount(target)
        .setNickname(target.lname + ' ' + target.fname)
        .setRoom(selfMember.room);
      await this.memberRepository.save(newMember);
      if (existApproval) await this.approvalRepository.delete(existApproval.id);
      const [msg, err] = await this.messagesService.addMsg(
        MessageTypeEnum.NOTIFICATION,
        null,
        roomId,
        `${self.lname} ${self.fname} added ${target.lname} ${target.fname} into room`,
        null,
      );
      return [msg, null];
    }
    //check if approval is exist
    if (existApproval) return [true, null];
    // create approval
    const approval = await this.approvalRepository.save({
      account: target,
      room: { id: roomId },
    });
    const adminAndVices = await this.getAdminAndVices(roomId);
    // create notification
    const endUsers: NotiEndUser[] = adminAndVices.map((member) => {
      const endUser = new NotiEndUser();
      endUser.receiver = member.account;
      return endUser;
    });
    const notification = await this.notificationRepository.save({
      type: NotificationTypeEnum.APPROVAL,
      content: `${target.lname} ${target.fname} wanted to join room ${selfMember.room.name}`,
      link: null,
      actor: target,
      approval,
      endUsers,
    });
    return [notification, null];
  }

  async kickMember(self: Account, roomId: number, targetAccountId: string) {
    const selfMember = await this.getMemberWithRoomRelation(self.id, roomId);
    if (!selfMember) return [null, 'Room not found'];
    if (selfMember.room.type != ChatRoomTypeEnum.MULTIPLE_USERS)
      return [null, 'Room type must be multiple users'];
    const target = await this.accountService.getById(targetAccountId);
    if (!target) return [null, 'User not found'];
    const targetMember = await this.getMember(targetAccountId, roomId);
    if (!targetMember) return [null, 'User already out'];
    if (
      convertMemberRoomRole(selfMember.role) <=
      convertMemberRoomRole(targetMember.role)
    )
      return [null, 'Can not kick user same role or higher than you'];
    await this.memberRepository.delete(targetMember.id);
    const [msg, err] = await this.messagesService.addMsg(
      MessageTypeEnum.NOTIFICATION,
      null,
      roomId,
      `${self.lname} ${self.fname} kicked ${target.lname} ${target.fname}`,
      null,
    );
    return [msg, null];
  }

  async appointMemberRole(
    self: Account,
    roomId: number,
    targetAccountId: string,
    roleAppointed: MemberRoleEnum,
  ) {
    const selfMember = await this.getMemberWithRoomRelation(self.id, roomId);
    if (!selfMember) return [null, 'Room not found'];
    if (selfMember.room.type != ChatRoomTypeEnum.MULTIPLE_USERS)
      return [null, 'Room type must be multiple users'];
    if (selfMember.role != MemberRoleEnum.ADMIN)
      return [null, 'You must be an admin'];
    const target = await this.accountService.getById(targetAccountId);
    if (!target) return [null, 'User not found'];
    const targetMember = await this.getMember(targetAccountId, roomId);
    if (!targetMember) return [null, 'Member not found'];
    if (targetMember.role == roleAppointed)
      return [null, `Role of user is already ${roleAppointed}`];
    targetMember.setRole(roleAppointed);
    const msgNotiText = `${self.lname} ${self.fname} appoint ${target.fname} ${target.lname} as ${roleAppointed}`;
    switch (roleAppointed) {
      case MemberRoleEnum.ADMIN:
        selfMember.role = MemberRoleEnum.USER;
        await this.memberRepository.save([selfMember, targetMember]);
        break;
      case MemberRoleEnum.VICE:
      case MemberRoleEnum.USER:
        await this.memberRepository.save(targetMember);
      default:
        break;
    }
    const [msg, err] = await this.messagesService.addMsg(
      MessageTypeEnum.NOTIFICATION,
      null,
      roomId,
      msgNotiText,
      null,
    );
    return [msg, null];
  }
}
