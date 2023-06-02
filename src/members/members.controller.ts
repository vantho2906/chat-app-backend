import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CurrentAccount from 'decorators/current-account.decorator';
import { Account } from 'accounts/entities/account.entity';
import { UpdateNickNameDto } from './dtos/update-nickname.dto';
import ResponseObject from 'etc/response-object';
import { AppointMemberRoleDto } from './dtos/appoint-member-role.dto';
import { Notification } from 'notifications/entities/notification.entity';
import { Member } from './entities/member.entity';

@ApiTags('members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post('update-nickname')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateNickName(
    @CurrentAccount() self: Account,
    @Body() updateNickNameDto: UpdateNickNameDto,
  ) {
    const { roomId, nickname, targetId } = updateNickNameDto;
    const [data, err] = await this.membersService.updateNickName(
      self,
      roomId,
      targetId,
      nickname,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Update nick name failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Update nick name success',
      data,
      err,
    );
  }

  @Post('toggle-limit-room/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async toggleLimitRoom(
    @CurrentAccount() self: Account,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    const [data, err] = await this.membersService.toggleLimitRoom(self, roomId);
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Toggle limit room failed',
        null,
        err,
      );
    const selfMember = data as Member;
    if (selfMember.isRoomLimited)
      return new ResponseObject(HttpStatus.OK, 'Limit room success', data, err);
    return new ResponseObject(HttpStatus.OK, 'Unlimit room success', data, err);
  }

  @Post('add-member')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async addMember(
    @CurrentAccount() self: Account,
    @Query('roomId', ParseIntPipe) roomId: number,
    @Query('targetAcccountId') targetAcccountId: string,
  ) {
    // data is notification or message
    const [data, err] = await this.membersService.addMember(
      self,
      roomId,
      targetAcccountId,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Add member failed',
        null,
        err,
      );
    if (data == true) {
      return new ResponseObject(
        HttpStatus.OK,
        'Waiting for approval',
        data,
        null,
      );
    }
    const notification = data as Notification;
    if (notification.content)
      return new ResponseObject(
        HttpStatus.OK,
        'Waiting for approval',
        data,
        null,
      );
    return new ResponseObject(HttpStatus.OK, 'Add member success', data, null);
  }

  @Post('kick-member')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async kickMember(
    @CurrentAccount() self: Account,
    @Query('roomId', ParseIntPipe) roomId: number,
    @Query('targetAcccountId') targetAcccountId: string,
  ) {
    // data is msg
    const [data, err] = await this.membersService.kickMember(
      self,
      roomId,
      targetAcccountId,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Kick member failed',
        null,
        err,
      );
    return new ResponseObject(HttpStatus.OK, 'Kick member success', data, err);
  }

  @Post('appoint-member-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async appointMemberRole(
    @CurrentAccount() self: Account,
    @Query() appointMemberRoleDto: AppointMemberRoleDto,
  ) {
    const { roomId, targetAcccountId, roleAppointed } = appointMemberRoleDto;
    // data is msg
    const [data, err] = await this.membersService.appointMemberRole(
      self,
      roomId,
      targetAcccountId,
      roleAppointed,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Appoint role for member failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Appoint role for member success',
      data,
      err,
    );
  }
}
