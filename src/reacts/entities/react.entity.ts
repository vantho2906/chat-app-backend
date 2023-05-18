import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { ChatRoom } from '../../chat-rooms/entities/chat-room.entity';
import { Message } from '../../messages/entities/message.entity';
@Entity()
export class React {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  icon: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account)
  account: Account;

  @ManyToOne(() => Message, (msg) => msg.reacts, { onDelete: 'CASCADE' })
  message: Message;

  @ManyToOne(() => ChatRoom, (room) => room.approvals)
  room: ChatRoom;
}
