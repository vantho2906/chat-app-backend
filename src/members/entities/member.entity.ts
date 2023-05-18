import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberRoleEnum } from '../../etc/enum';
import { Account } from '../../accounts/entities/account.entity';
import { ChatRoom } from '../../chat-rooms/entities/chat-room.entity';
@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MemberRoleEnum, default: MemberRoleEnum.USER })
  role: MemberRoleEnum;

  @Column()
  nickname: string;

  @CreateDateColumn()
  joinedAt: Date;

  @ManyToOne(() => Account, (account) => account.roomMembers, {
    onDelete: 'CASCADE',
  })
  account: Account;

  @ManyToOne(() => ChatRoom, (room) => room.members)
  room: ChatRoom;
}
