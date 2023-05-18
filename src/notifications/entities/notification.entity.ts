import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Message } from '../../messages/entities/message.entity';
import { FriendRequest } from '../../friend-requests/entities/friendRequest.entity';
@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({ nullable: true })
  link: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account)
  actor: Account;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  message: Message;

  @OneToOne(() => FriendRequest, { onDelete: 'CASCADE' })
  @JoinColumn()
  friendRequest: FriendRequest;

  @ManyToMany(() => Account, (account) => account.notifications)
  @JoinTable()
  receivers: Account[];
}
