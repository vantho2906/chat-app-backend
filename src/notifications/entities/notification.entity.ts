import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Message } from '../../messages/entities/message.entity';
import { FriendRequest } from '../../friend-requests/entities/friendRequest.entity';
import { NotiEndUser } from '../../noti-end-users/entities/noti-end-user.entity';
import { Approval } from '../../approvals/entities/approval.entity';
import { NotificationTypeEnum } from '../../etc/enums';
@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: NotificationTypeEnum;

  @Column()
  content: string;

  @Column({ nullable: true })
  link: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  actor: Account;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  message: Message;

  @ManyToOne(() => Approval, { onDelete: 'CASCADE' })
  approval: Approval;

  @OneToMany(() => NotiEndUser, (endUser) => endUser.notification, {
    cascade: true,
  })
  endUsers: NotiEndUser[];

  @OneToOne(() => FriendRequest, { onDelete: 'CASCADE' })
  @JoinColumn()
  friendRequest: FriendRequest;
}
