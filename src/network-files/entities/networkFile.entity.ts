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

  @ManyToOne(() => Message, (msg) => msg.files)
  message: Message;

  setFilename(filename: string) {
    this.filename = filename;
    return this;
  }

  setMimeType(mimeType: string) {
    this.mimeType = mimeType;
    return this;
  }

  setFileIdOnDrive(fileIdOnDrive: string) {
    this.fileIdOnDrive = fileIdOnDrive;
    return this;
  }

  setUrl(url: string) {
    this.url = url;
    return this;
  }

  setMesage(message: Message) {
    this.message = message;
    return this;
  }
}
