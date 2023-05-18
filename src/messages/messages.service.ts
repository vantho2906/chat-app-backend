import { Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageTypeEnum } from 'etc/enum';
import { NetworkFile } from 'network-files/entities/networkFile.entity';
import { Account } from 'accounts/entities/account.entity';
import { ChatRoom } from 'chat-rooms/entities/chat-room.entity';
import { GoogleApiService } from 'google-api/google-api.service';
import { getGoogleDriveUrl } from 'etc/google-drive-url';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,

    @InjectRepository(NetworkFile)
    private readonly networkFileRepository: Repository<NetworkFile>,

    private readonly googleApiService: GoogleApiService,
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
      .innerJoinAndSelect('msg.sender', 'sender')
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
        networkFile.filename = file.originalname;
        networkFile.mimeType = file.mimetype;
        networkFile.fileIdOnDrive = uploadedFile.id;
        networkFile.url = getGoogleDriveUrl(uploadedFile.id);
        msgFiles.push(networkFile);
      }
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let link: string = null;
    if (text) {
      const links = text.match(urlRegex);
      if (links && links.length > 0) link = links[0];
    }
    const msg = await this.messageRepository.create({
      type,
      text: !text ? null : text,
      link,
      sender: sender,
      room: { id: room.id },
      files: msgFiles,
    });
    await this.messageRepository.save(msg);
    msg.files = msg.files.map((file: NetworkFile) => {
      delete file.account;
      return file;
    });
    room.updatedAt = new Date();
    await this.chatRoomRepository.save(room);
    return [msg, null];
  }

  async editMsgText(self: Account, msgId: number, text: string) {
    const msg = await this.messageRepository.findOne({
      where: { id: msgId },
      relations: {
        sender: true,
      },
    });
    if (!msg) return [null, 'Message not found'];
    if (msg.sender.id != self.id)
      return [null, 'Can not edit message of other ones'];
    // more than 10 minutes
    if ((new Date().getTime() - msg.createdAt.getTime()) / (1000 * 60) > 10)
      return [null, 'More than 10 minutes since created'];
    msg.text = text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let link: string = null;
    if (text) {
      const links = text.match(urlRegex);
      if (links && links.length > 0) link = links[0];
    }
    msg.link = link;
    await this.messageRepository.save(msg);
    return [msg, null];
  }

  async recallMsg(self: Account, msgId: number) {
    const msg = await this.messageRepository.findOne({
      where: { id: msgId },
      relations: {
        sender: true,
        files: true,
      },
    });
    if (!msg) return [null, 'Message not found'];
    if (msg.sender.id != self.id)
      return [null, 'Can not recall message of other ones'];
    msg.isDeleted = true;
    const fileIds = [];
    if (msg.files && msg.files.length > 0) {
      console.log(msg.files);
      const fileIdsOnDrive = [];
      for (const file of msg.files) {
        fileIdsOnDrive.push(file.fileIdOnDrive);
        fileIds.push(file.id);
      }
      await this.googleApiService.deleteMultipleFiles(fileIdsOnDrive);
    }
    msg.files = null;
    await this.messageRepository.save(msg);
    if (fileIds.length > 0) await this.networkFileRepository.delete(fileIds);
    return [msg, null];
  }
}
