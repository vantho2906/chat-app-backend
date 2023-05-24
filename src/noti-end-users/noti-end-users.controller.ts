import { Controller } from '@nestjs/common';
import { NotiEndUsersService } from './noti-end-users.service';

@Controller('noti-end-users')
export class NotiEndUsersController {
  constructor(private readonly notiEndUsersService: NotiEndUsersService) {}
}
