import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberRoleEnum } from '../../etc/enums';
import { Account } from '../../accounts/entities/account.entity';
import { ChatRoom } from '../../chat-rooms/entities/chat-room.entity';
@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MemberRoleEnum, default: MemberRoleEnum.USER })
  role: MemberRoleEnum;

  @Column({ default: false })
  isRoomLimited: boolean;

  @Column({ nullable: true })
  nickname: string;

  @CreateDateColumn()
  joinedAt: Date;

  @ManyToOne(() => Account, (account) => account.roomMembers)
  account: Account;

  @ManyToOne(() => ChatRoom, (room) => room.members, {
    onDelete: 'CASCADE',
  })
  room: ChatRoom;

  setRole(role: MemberRoleEnum) {
    this.role = role;
    return this;
  }

  setIsRoomLimited(isRoomLimited: boolean) {
    this.isRoomLimited = isRoomLimited;
    return this;
  }

  setNickname(nickname: string) {
    this.nickname = nickname;
    return this;
  }

  setAccount(account: Account) {
    this.account = account;
    return this;
  }

  setRoom(room: ChatRoom) {
    this.room = room;
    return this;
  }
}
