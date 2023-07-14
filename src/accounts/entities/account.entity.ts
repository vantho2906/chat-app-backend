import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GenderEnum, RoleEnum } from '../../etc/enums';
import { NetworkFile } from '../../network-files/entities/networkFile.entity';
import { Member } from '../../members/entities/member.entity';
import { Approval } from '../../approvals/entities/approval.entity';
import { FriendRequest } from '../../friend-requests/entities/friendRequest.entity';
import { Message } from '../../messages/entities/message.entity';
import { IsNotEmpty } from 'class-validator';
import { NotiEndUser } from '../../noti-end-users/entities/noti-end-user.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: RoleEnum, default: RoleEnum.USER })
  role: RoleEnum;

  @IsNotEmpty()
  @Column()
  fname: string;

  @IsNotEmpty()
  @Column()
  lname: string;

  @Column({ type: 'enum', enum: GenderEnum, nullable: true })
  gender: GenderEnum;

  @Column({ nullable: true })
  dob: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  offlineAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  avatarUrl: string;

  @OneToMany(() => Member, (member) => member.account, {
    cascade: true,
  })
  roomMembers: Member[];

  @OneToMany(() => Approval, (approval) => approval.account)
  approvals: Approval[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.sender)
  sendingFriendRequests: FriendRequest[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.receiver)
  receivingFriendRequests: FriendRequest[];

  @OneToMany(() => Message, (msg) => msg.sender)
  sendingMsgs: Message[];

  @ManyToMany(() => NotiEndUser, (noti) => noti.receiver)
  notiEndUsers: NotiEndUser[];

  @ManyToMany(() => Account)
  blocks: Account[];

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
