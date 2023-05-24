import { Module } from '@nestjs/common';
import { NotiEndUsersService } from './noti-end-users.service';
import { NotiEndUsersController } from './noti-end-users.controller';

@Module({
  controllers: [NotiEndUsersController],
  providers: [NotiEndUsersService],
})
export class NotiEndUsersModule {}
