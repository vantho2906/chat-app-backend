import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'accounts/entities/account.entity';
import { ChatRoom } from 'chat-rooms/entities/chat-room.entity';
import { Message } from 'messages/entities/message.entity';
import { Repository } from 'typeorm';
import { Member } from 'members/entities/member.entity';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async getAllNotifications(self: Account) {
    const notifications = await this.notificationRepository.find({
      where: {
        endUsers: { receiver: { id: self.id } },
      },
      relations: {
        actor: true,
        message: { files: true },
        approval: { account: true },
        friendRequest: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return [notifications, null];
  }
}
