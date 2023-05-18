import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRoomTypeEnum } from '../../etc/enum';
import { Member } from '../../members/entities/member.entity';
import { Approval } from '../../approvals/entities/approval.entity';
import { Message } from '../../messages/entities/message.entity';
@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'enum', enum: ChatRoomTypeEnum })
  type: ChatRoomTypeEnum;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isLimited: boolean;

  avatarUrls: string[];

  @OneToMany(() => Approval, (approval) => approval.room)
  approvals: Approval[];

  @OneToMany(() => Member, (member) => member.room, {
    cascade: true,
  })
  members: Member[];

  @OneToMany(() => Message, (msg) => msg.room)
  messages: Message[];
}
