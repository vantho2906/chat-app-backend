import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CurrentAccount from 'decorators/current-account.decorator';
import { Account } from 'accounts/entities/account.entity';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import ResponseObject from 'etc/response-object';

@Controller('friends')
@ApiTags('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('/get-friend-list')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getFriendList(@CurrentAccount() self: Account) {
    const [data, err] = await this.friendsService.getFriendList(self.id);
    return new ResponseObject(
      HttpStatus.OK,
      'Get friend list success',
      data,
      null,
    );
  }
}
