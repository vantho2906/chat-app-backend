import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.sendingFriendRequests)
  sender: Account;

  @ManyToOne(() => Account, (account) => account.receivingFriendRequests)
  receiver: Account;
}
