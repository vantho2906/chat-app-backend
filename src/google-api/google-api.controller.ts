import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GoogleApiService } from './google-api.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
@ApiTags('google-api')
@Controller('google-api')
export class GoogleApiController {
  constructor(private readonly googleApiService: GoogleApiService) {}

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
  @Post('upload')
  async uploadFile(
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
  ) {
    return await this.googleApiService.uploadFile(file);
  }

  @Get('get-file-url/:fileId')
  async getFileUrlById(@Param('fileId') fileId: string) {
    return await this.googleApiService.getFileById(fileId);
  }

  @Get('get-all')
  async getAllFiles(@Query('fileId') fileId: string) {
    return await this.googleApiService.getFileByName(fileId);
  }
}
