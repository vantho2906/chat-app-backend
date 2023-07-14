import { HandleApprovalEnum, MessageTypeEnum } from './../etc/enums';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'accounts/entities/account.entity';
import { ChatRoom } from 'chat-rooms/entities/chat-room.entity';
import { Message } from 'messages/entities/message.entity';
import { Repository } from 'typeorm';
import { Approval } from './entities/approval.entity';
import { Member } from 'members/entities/member.entity';
import { NetworkFile } from 'network-files/entities/networkFile.entity';
import { GoogleApiService } from 'google-api/google-api.service';
import { MessagesService } from 'messages/messages.service';
import { ChatRoomTypeEnum, MemberRoleEnum } from 'etc/enums';
import { ChatRoomsService } from 'chat-rooms/chat-rooms.service';
import { MembersService } from 'members/members.service';

@Injectable()
export class ApprovalsService {
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

    private readonly chatRoomService: ChatRoomsService,

    private readonly messagesService: MessagesService,

    private readonly memberService: MembersService,
  ) {}

  async getAllApprovals(self: Account, roomId: number) {
    const selfMember = await this.memberService.getMemberWithRoomRelation(
      self.id,
      roomId,
    );
    if (!selfMember) return [null, 'Room not found'];
    if (selfMember.room.type != ChatRoomTypeEnum.MULTIPLE_USERS)
      return [null, 'Room type must be multiple users'];
    if (selfMember.role == MemberRoleEnum.USER)
      return [null, 'You dont have permission'];
    const approvals = await this.approvalRepository.find({
      where: {
        room: { id: roomId },
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return [approvals, null];
  }

  async acceptAllApprovals(self: Account, roomId: number) {
    const selfMember = await this.memberService.getMemberWithRoomRelation(
      self.id,
      roomId,
    );
    if (!selfMember) return [null, 'Room not found'];
    if (selfMember.room.type != ChatRoomTypeEnum.MULTIPLE_USERS)
      return [null, 'Room type must be multiple users'];
    if (selfMember.role == MemberRoleEnum.USER)
      return [null, 'You dont have permission'];
    const approvals = await this.approvalRepository.find({
      where: {
        room: { id: roomId },
      },
      order: {
        createdAt: 'DESC',
      },
    });
    if (!approvals.length) return [null, 'Not have any approvals'];
    //obtain new members
    const newMembers = approvals.map((approval) => {
      const member = new Member();
      member.account = approval.account;
      member.room = selfMember.room;
      return member;
    });
    const approvalIds = approvals.map((approval) => approval.id);
    // delete old approvals
    await this.approvalRepository.delete(approvalIds);
    await this.memberRepository.save(newMembers);
    return [newMembers, null];
  }

  async handleApproval(
    self: Account,
    roomId: number,
    approvalId: number,
    decision: HandleApprovalEnum,
  ) {
    const selfMember = await this.memberService.getMemberWithRoomRelation(
      self.id,
      roomId,
    );
    if (!selfMember) return [null, 'Room not found'];
    if (selfMember.room.type != ChatRoomTypeEnum.MULTIPLE_USERS)
      return [null, 'Room type must be multiple users'];
    if (selfMember.role == MemberRoleEnum.USER)
      return [null, 'You dont have permission'];
    const approval = await this.approvalRepository.findOne({
      where: {
        id: approvalId,
      },
      relations: {
        account: true,
      },
    });
    if (!approval) return [null, 'Approval not exist'];

    const isUserOfApprovalExistInRoom =
      !!(await this.memberService.getMemberWithRoomRelation(
        approval.account.id,
        roomId,
      ));
    if (isUserOfApprovalExistInRoom) return [null, 'User already in room'];
    if (decision == HandleApprovalEnum.ACCEPT) {
      const newMember = new Member();
      newMember.setAccount(approval.account).setRoom(selfMember.room);
      await this.memberRepository.save(newMember);
      await this.approvalRepository.delete(approval.id);
      // create message
      const [msg, err] = await this.messagesService.addMsg(
        MessageTypeEnum.NOTIFICATION,
        null,
        roomId,
        `${self.lname} ${self.fname} added ${approval.account.lname} ${approval.account.fname}`,
        null,
      );
      return [msg, null];
    }
    await this.approvalRepository.delete(approval.id);
    return [true, null];
  }
}
