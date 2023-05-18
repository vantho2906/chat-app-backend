import { Account } from '../../accounts/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from '../../messages/entities/message.entity';
@Entity()
export class NetworkFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  filename: string;

  @Column()
  mimeType: string;

  @Column({ nullable: true })
  fileIdOnDrive: string;

  @Column()
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Account, (account) => account.avatar)
  account: Account;

  @ManyToOne(() => Message, (msg) => msg.files)
  message: Message;
}
