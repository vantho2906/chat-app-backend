import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FriendRequestsService } from './friend-requests.service';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import CurrentAccount from 'decorators/current-account.decorator';
import { Account } from 'accounts/entities/account.entity';
import ResponseObject from 'etc/response-object';

@ApiTags('friend-requests')
@Controller('friend-requests')
export class FriendRequestsController {
  constructor(private readonly friendRequestsService: FriendRequestsService) {}

  @Post('send-friend-request/:receiverId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'receiverId', required: true })
  async sendFriendRequest(
    @CurrentAccount() self: Account,
    @Param('receiverId') receiverId: string,
  ) {
    const [data, err] = await this.friendRequestsService.sendFriendRequest(
      self.id,
      receiverId,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Send friend request failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Send friend request success',
      data,
      null,
    );
  }

  @Post('delete-friend-request/:opponentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'opponentId', required: true })
  async cancelFriendRequest(
    @CurrentAccount() self: Account,
    @Param('opponentId') opponentId: string,
  ) {
    const [data, err] = await this.friendRequestsService.cancelFriendRequest(
      self.id,
      opponentId,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Delete friend request failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Delete friend request success',
      data,
      null,
    );
  }

  @Get('get-status-friend/:opponentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'opponentId', required: true })
  async getFriendStatus(
    @CurrentAccount() self: Account,
    @Param('opponentId') opponentId: string,
  ) {
    const [data, err] = await this.friendRequestsService.getFriendStatus(
      self.id,
      opponentId,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Get friend status failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Get friend status success',
      data,
      null,
    );
  }

  @Post('accept-friend/:opponentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'opponentId', required: true })
  async acceptFriend(
    @CurrentAccount() self: Account,
    @Param('opponentId') opponentId: string,
  ) {
    const [data, err] = await this.friendRequestsService.acceptFriend(
      self,
      opponentId,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Accept friend failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Accept friend success',
      data,
      null,
    );
  }

  @Post('cancel-friend/:opponentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'opponentId', required: true })
  async cancelFriend(
    @CurrentAccount() self: Account,
    @Param('opponentId') opponentId: string,
  ) {
    const [data, err] = await this.friendRequestsService.cancelFriend(
      self.id,
      opponentId,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Cancel friend failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Cancel friend success',
      data,
      null,
    );
  }
}
