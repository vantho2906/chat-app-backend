import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import CurrentAccount from 'decorators/current-account.decorator';
import { Account } from 'accounts/entities/account.entity';
import { CreateRoomDto } from './dtos/create-room-dto';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import ResponseObject from 'etc/response-object';
import { FileCategoryEnum } from 'etc/enums';
import { UpdateRoomNameDto } from './dtos/update-room-name.dto';
import { Message } from 'messages/entities/message.entity';

@ApiTags('chat-rooms')
@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(private readonly chatRoomsService: ChatRoomsService) {}

  @Post('create-room')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createRoom(
    @CurrentAccount() self: Account,
    @Body() { memberIdList, type }: CreateRoomDto,
  ) {
    const [data, err] = await this.chatRoomsService.createRoom(
      self,
      memberIdList,
      type,
    );
    if (err && data) {
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Create room failed',
        data,
        err,
      );
    }
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Create room failed',
        null,
        err,
      );
    return new ResponseObject(HttpStatus.OK, 'Create room success', data, err);
  }

  @Get('get-all-rooms')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllRooms(@CurrentAccount() self: Account) {
    const [data, err] = await this.chatRoomsService.getAllRooms(self);
    return new ResponseObject(
      HttpStatus.OK,
      'Get all rooms success',
      data,
      err,
    );
  }

  @Get('get-all-room-members/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllRoomMembers(
    @CurrentAccount() self: Account,
    @Param('roomId') roomId: number,
  ) {
    const [data, err] = await this.chatRoomsService.getAllMembersInRoom(
      self,
      roomId,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Get room members failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Get room members success',
      data,
      err,
    );
  }

  @Get('get-all-room-files')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'roomId' })
  @ApiQuery({
    name: 'fileCategory',
    example: FileCategoryEnum.MEDIA,
    enum: FileCategoryEnum,
  })
  async getAllRoomFiles(
    @CurrentAccount() self: Account,
    @Query('roomId', ParseIntPipe) roomId: number,
    @Query('fileCategory') fileCategory: FileCategoryEnum,
  ) {
    const [data, err] = await this.chatRoomsService.getAllRoomFiles(
      self,
      roomId,
      fileCategory,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Get all files failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Get all files success',
      data,
      err,
    );
  }

  @Post('update-room-name')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateRoomNameDto })
  @ApiBearerAuth()
  async updateRoomName(
    @CurrentAccount() self: Account,
    @Body() updateRoomNameDto: UpdateRoomNameDto,
  ) {
    const { roomId, name } = updateRoomNameDto;
    const [data, err] = await this.chatRoomsService.updateRoomName(
      self,
      roomId,
      name,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Update room name failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Update room name success',
      data,
      err,
    );
  }

  @Post('delete-room/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteRoom(
    @CurrentAccount() self: Account,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    const [data, err] = await this.chatRoomsService.deleteRoom(self, roomId);
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Delete room failed',
        null,
        err,
      );
    return new ResponseObject(HttpStatus.OK, 'Delete room success', data, err);
  }

  @Post('toggle-approval-feature/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async toggleApprovalFeature(
    @CurrentAccount() self: Account,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    // data is array of msgs
    const [data, err] = await this.chatRoomsService.toggleApprovalFeature(
      self,
      roomId,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Toggle approval feature failed',
        null,
        err,
      );
    const msgs = data as Message[];
    if (msgs[0].text.includes('on'))
      return new ResponseObject(
        HttpStatus.OK,
        'Turn on approval feature success',
        data,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Turn off approval feature success',
      data,
      err,
    );
  }

  @Post('leave-room/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async leaveRoom(
    @CurrentAccount() self: Account,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    // data is msg
    const [data, err] = await this.chatRoomsService.leaveRoom(self, roomId);
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Leave room failed',
        null,
        err,
      );
    return new ResponseObject(HttpStatus.OK, 'Leave room success', data, err);
  }
}
