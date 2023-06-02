import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CurrentAccount from 'decorators/current-account.decorator';
import { Account } from 'accounts/entities/account.entity';
import ResponseObject from 'etc/response-object';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('get-all-notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllNotifications(@CurrentAccount() self: Account) {
    const [data, err] = await this.notificationsService.getAllNotifications(
      self,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Get all notifications failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Get all notifications success',
      data,
      err,
    );
  }
}
