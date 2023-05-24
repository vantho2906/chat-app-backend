import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { FileTypeAllowEnum } from './enums';

interface FileUploadOptions {
  maxCount?: number;
  fileTypeAllow?: FileTypeAllowEnum[];
  maxFileSize?: number;
}

export class FileUploadPipe implements PipeTransform {
  constructor(private readonly options?: FileUploadOptions) {}
  transform(value: Express.Multer.File[], metadata: ArgumentMetadata) {
    if (!value) return null;
    if (!Array.isArray(value)) value = [value];
    if (this.options.maxCount && value.length > this.options.maxCount) {
      throw new BadRequestException(
        `Max file count is ${this.options.maxCount}`,
      );
    }
    if (this.options.fileTypeAllow) {
      const fileTypeNotAllow = value.find(
        (file) =>
          !this.options.fileTypeAllow.includes(
            file.mimetype as FileTypeAllowEnum,
          ),
      );
      if (fileTypeNotAllow)
        throw new BadRequestException(`File type not allowed`);
    }
    if (this.options.maxFileSize) {
      const exceedsMaxFileSize = value.find(
        (file) => file.size > this.options.maxFileSize,
      );
      if (exceedsMaxFileSize)
        throw new BadRequestException(
          `Max file size is ${this.options.maxFileSize}`,
        );
    }
    return value;
  }
}
