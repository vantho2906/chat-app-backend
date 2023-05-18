import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import CurrentAccount from 'decorators/current-account.decorator';
import { Account } from 'accounts/entities/account.entity';
import { UpdateNickNameDto } from './dtos/update-nickname.dto';
import ResponseObject from 'etc/response-object';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post('update-room-name')
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
        data,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Update nick name success',
      data,
      err,
    );
  }
}
