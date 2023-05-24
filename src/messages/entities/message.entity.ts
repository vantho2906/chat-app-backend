import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { ChatRoom } from '../../chat-rooms/entities/chat-room.entity';
import { MessageTypeEnum } from '../../etc/enums';
import { React } from '../../reacts/entities/react.entity';
import { NetworkFile } from '../../network-files/entities/networkFile.entity';
@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MessageTypeEnum,
    default: MessageTypeEnum.NORMAL,
  })
  type: MessageTypeEnum;

  @Column({ nullable: true })
  text: string;

  @Column({ nullable: true })
  link: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  isPin: boolean;

  @Column({ nullable: true })
  editAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.sendingMsgs)
  sender: Account;

  @ManyToOne(() => ChatRoom, (room) => room.messages, { onDelete: 'CASCADE' })
  room: ChatRoom;

  @OneToMany(() => React, (react) => react.message)
  reacts: React[];

  @OneToMany(() => NetworkFile, (file) => file.message, { cascade: true })
  files: NetworkFile[];
}
