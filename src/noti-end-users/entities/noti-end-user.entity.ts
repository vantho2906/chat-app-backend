import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Notification } from '../../notifications/entities/notification.entity';
@Entity()
export class NotiEndUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => Notification, (notification) => notification.endUsers, {
    onDelete: 'CASCADE',
  })
  notification: Notification;

  @ManyToOne(() => Account, (account) => account.notiEndUsers)
  receiver: Account;
}
