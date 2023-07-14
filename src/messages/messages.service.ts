import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageTypeEnum, TogglePinMessageEnum } from 'etc/enums';
import { NetworkFile } from 'network-files/entities/networkFile.entity';
import { Account } from 'accounts/entities/account.entity';
import { ChatRoom } from 'chat-rooms/entities/chat-room.entity';
import { GoogleApiService } from 'google-api/google-api.service';
import { getGoogleDriveUrl } from 'etc/google-drive-url';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Member } from 'members/entities/member.entity';
import { MembersService } from 'members/members.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,

    @InjectRepository(NetworkFile)
    private readonly networkFileRepository: Repository<NetworkFile>,

    private readonly googleApiService: GoogleApiService,

    @Inject(forwardRef(() => MembersService))
    private readonly memberService: MembersService,
  ) {}

  async getMsgById(id: number) {
    const msg = await this.messageRepository.findOne({
      where: {
        id,
      },
      relations: {
        files: true,
        reacts: true,
      },
    });
    if (!msg) return [null, 'Message not found'];
    return [msg, null];
  }

  async getMsgWithSenderInfo(msgId: number) {
    const msg = await this.messageRepository.findOne({
      where: { id: msgId },
      relations: {
        sender: true,
      },
    });
    return msg;
  }

  async getMsgWithSenderAndFiles(msgId: number) {
    const msg = await this.messageRepository.findOne({
      where: { id: msgId },
      relations: {
        sender: true,
        files: true,
      },
    });
    return msg;
  }

  getLinkFromTextMsg(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let link: string = null;
    if (text) {
      const links = text.match(urlRegex);
      if (links && links.length > 0) link = links[0];
    }
    return link;
  }

  async getAllMsgsOfRoom(
    account: Account,
    roomId: number,
    options: IPaginationOptions,
  ) {
    const room = await this.chatRoomRepository.findOne({
      where: {
        id: roomId,
        members: { account: { id: account.id } },
      },
    });
    if (!room) return [null, 'Room not found'];
    const msgQueryBuilder = await this.messageRepository
      .createQueryBuilder('msg')
      .innerJoin('msg.room', 'room')
      .leftJoinAndSelect('msg.sender', 'sender')
      .leftJoinAndSelect('msg.files', 'files')
      .where('room.id = :roomId', { roomId })
      .orderBy('msg.createdAt', 'DESC');
    return [await paginate<Message>(msgQueryBuilder, options), null];
  }
  async addMsg(
    type: MessageTypeEnum,
    sender: Account,
    roomId: number,
    text: string,
    files: Express.Multer.File[],
  ) {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
    });
    if (!room) return [null, 'Room not found'];
    let msgFiles: NetworkFile[] = null;
    if (files) {
      msgFiles = [];
      for (const file of files) {
        const uploadedFile = await this.googleApiService.uploadFile(file);
        const networkFile = new NetworkFile();
        networkFile
          .setFilename(file.originalname)
          .setMimeType(file.mimetype)
          .setFileIdOnDrive(uploadedFile.id)
          .setUrl(getGoogleDriveUrl(uploadedFile.id));
        msgFiles.push(networkFile);
      }
    }
    const link = this.getLinkFromTextMsg(text);
    const msg = await this.messageRepository.create({
      type,
      text: !text ? null : text,
      link,
      sender: sender,
      room: { id: room.id },
      files: msgFiles,
    });
    await this.messageRepository.save(msg);
    if (msg.files && msg.files.length > 0) {
      msg.files = msg.files.map((file: NetworkFile) => {
        return file;
      });
    }
    room.updatedAt = new Date();
    await this.chatRoomRepository.save(room);
    return [msg, null];
  }

  async editMsgText(self: Account, msgId: number, text: string) {
    const msg = await this.getMsgWithSenderInfo(msgId);
    if (!msg) return [null, 'Message not found'];
    if (msg.sender.id != self.id)
      return [null, 'Can not edit message of other ones'];
    const defaultTimesAllowEdit = 10;
    // more than 10 minutes
    if (
      (new Date().getTime() - msg.createdAt.getTime()) / (1000 * 60) >
      defaultTimesAllowEdit
    )
      return [null, `More than ${defaultTimesAllowEdit} minutes since created`];
    msg.text = text;
    msg.link = this.getLinkFromTextMsg(text);
    await this.messageRepository.save(msg);
    return [msg, null];
  }

  async recallMsg(self: Account, msgId: number) {
    const msg = await this.getMsgWithSenderAndFiles(msgId);
    if (!msg) return [null, 'Message not found'];
    if (msg.sender.id != self.id)
      return [null, 'Can not recall message of other ones'];
    msg.isDeleted = true;
    const fileIdsInDB = [];
    const fileIdsOnDrive = [];
    if (msg.files && msg.files.length > 0) {
      for (const file of msg.files) {
        fileIdsOnDrive.push(file.fileIdOnDrive);
        fileIdsInDB.push(file.id);
      }
      await this.googleApiService.deleteMultipleFiles(fileIdsOnDrive);
    }
    msg.files = null;
    await this.messageRepository.save(msg);
    if (fileIdsInDB.length > 0)
      await this.networkFileRepository.delete(fileIdsInDB);
    return [msg, null];
  }

  async getAllPinMsgs(self: Account, roomId: number) {
    const selfMember = await this.memberService.getMemberWithRoomRelation(
      self.id,
      roomId,
    );
    if (!selfMember) return [null, 'Room not found'];
    const pinMsgs = await this.messageRepository.find({
      where: {
        room: { id: roomId },
        isPin: true,
      },
      relations: {
        files: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return [pinMsgs, null];
  }

  async togglePinMsg(self: Account, msgId: number) {
    const selfMember = await this.memberService.getMemberWithMsg(
      self.id,
      msgId,
    );
    if (!selfMember) return [null, 'Message not found'];
    const msg = selfMember.room.messages[0];
    msg.isPin = true ? false : true;
    await this.messageRepository.save(msg);
    return [msg, null];
  }
}
