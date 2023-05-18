import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import CurrentAccount from 'decorators/current-account.decorator';
import { Account } from './entities/account.entity';
import ResponseObject from 'etc/response-object';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { UpdateAccountInfoDto } from './dtos/update-account-info-dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('update-avatar')
  async updateAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 20 }),
          new FileTypeValidator({
            fileType: 'image/jpeg|image/png|image/jpg|image/svg|image/gif',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentAccount() account: Account,
  ) {
    console.log(account);
    const [data, err] = await this.accountsService.updateAvatar(account, file);
    if (err)
      return new ResponseObject(
        HttpStatus.BAD_REQUEST,
        'Update avatar failed',
        null,
        err,
      );
    return new ResponseObject(
      HttpStatus.OK,
      'Update avatar success',
      data,
      null,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('update-personal-info')
  async updatePersonalInfo(
    @Body() updateInfo: UpdateAccountInfoDto,
    @CurrentAccount() account: Account,
  ) {
    const [data, err] = await this.accountsService.updatePersonalInfo(
      account,
      updateInfo,
    );
    return new ResponseObject(HttpStatus.OK, 'Update Info success', data, null);
  }
}
