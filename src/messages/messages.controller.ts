import {
  Controller,
  Get,
  Param,
  HttpStatus,
  Post,
  UseInterceptors,
  Body,
  UseGuards,
  ParseIntPipe,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import ResponseObject from 'etc/response-object';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadPipe } from 'etc/file-upload.pipe';
import { FileTypeAllowEnum } from 'etc/enums';
import { CreateMessageDto } from './dtos/create-message.dto';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import CurrentAccount from 'decorators/current-account.decorator';
import { Account } from 'accounts/entities/account.entity';
import { PaginationOptionsDto } from 'etc/pagination-options.dto';
import { EditMessageTextDto } from './dtos/edit-message-text.dto';
import { Message } from './entities/message.entity';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('get-message-by-id/:id')
  async getMsgsById(@Param('id') id: number) {
    const [data, err] = await this.messagesService.getMsgById(id);
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Get message failed',
        null,
        err,
      );
    return new ResponseObject(HttpStatus.OK, 'Get message success', data, err);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'roomId', required: true })
  @Get('get-all-msgs-of-room')
  async getAllMsgsOfRoom(
    @CurrentAccount() account: Account,
    @Query('roomId', ParseIntPipe) roomId: number,
    @Query() options: PaginationOptionsDto,
  ) {
    const [data, err] = await this.messagesService.getAllMsgsOfRoom(
      account,
      roomId,
      options,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Get all messages failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Get all messages success',
      data,
      null,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('add-message')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateMessageDto })
  async addMessage(
    @UploadedFiles(
      new FileUploadPipe({
        maxCount: 20,
        fileTypeAllow: Object.values(FileTypeAllowEnum),
        maxFileSize: 1024 * 1024 * 10,
      }),
    )
    files: Express.Multer.File[],
    @CurrentAccount() sender: Account,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const { type, roomId, text } = createMessageDto;
    console.log(text);
    const [data, err] = await this.messagesService.addMsg(
      type,
      sender,
      roomId,
      text,
      files,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Add new message failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Add new message success',
      data,
      null,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('edit-msg-text')
  async editMsgText(
    @CurrentAccount() self: Account,
    @Body() editMsgTextDto: EditMessageTextDto,
  ) {
    const { msgId, text } = editMsgTextDto;
    const [data, err] = await this.messagesService.editMsgText(
      self,
      msgId,
      text,
    );
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Edit message failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Edit message success',
      data,
      null,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('recall-msg/:msgId')
  async recallMsg(
    @CurrentAccount() self: Account,
    @Param('msgId', ParseIntPipe) msgId: number,
  ) {
    const [data, err] = await this.messagesService.recallMsg(self, msgId);
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Recall message failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Recall message success',
      data,
      null,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('get-all-pin-msgs/:roomId')
  async getAllPinMsgs(
    @CurrentAccount() self: Account,
    @Param('msgId', ParseIntPipe) roomId: number,
  ) {
    const [data, err] = await this.messagesService.getAllPinMsgs(self, roomId);
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Get all pin messages failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Get all pin messages success',
      data,
      null,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('toggle-pin-message/:msgId')
  async togglePinMsg(
    @CurrentAccount() self: Account,
    @Param('msgId', ParseIntPipe) msgId: number,
  ) {
    const [data, err] = await this.messagesService.togglePinMsg(self, msgId);
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Toggle pin message failed',
        null,
        err,
      );
    const msg = data as Message;
    if (msg.isPin)
      return new ResponseObject(
        HttpStatus.OK,
        'Pin message success',
        data,
        null,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Unpin message success',
      data,
      null,
    );
  }
}
