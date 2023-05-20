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
import { FileCategoryEnum } from 'etc/enum';
import { UpdateRoomNameDto } from './dtos/update-room-name.dto';

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
        data,
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
        data,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Update room name success',
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
    const [data, err] = await this.chatRoomsService.getAllRoomMembers(
      self,
      roomId,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Get room members failed',
        data,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Get room members success',
      data,
      err,
    );
  }

  @Post('delete-room/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteRoom(
    @CurrentAccount() self: Account,
    @Param('roomId') roomId: number,
  ) {
    const [data, err] = await this.chatRoomsService.deleteRoom(self, roomId);
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Delete room failed',
        data,
        err,
      );
    return new ResponseObject(HttpStatus.OK, 'Delete room success', data, err);
  }
}
